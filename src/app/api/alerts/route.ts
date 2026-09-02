import { NextResponse } from 'next/server';
import { fetchLatestRates, ApiError } from '@/lib/api';
import { getCachedRates, setCachedRates } from '@/lib/cache';
import { isAllowedOrigin, isCronRequest } from '@/lib/csrf';
import { isValidCurrencyCode } from '@/lib/currencies';
import { logger } from '@/lib/logger';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { parsePairKey } from '@/lib/utils';
import type { RateAlert, StoredAlert } from '@/types/currency';

export const runtime = 'nodejs';

const alerts = new Map<string, StoredAlert>();

/**
 * GET lists alerts for X-Client-Id, or runs the cron checker when authorized.
 * POST creates, PATCH updates, DELETE removes — CSRF via origin check.
 */
export async function GET(request: Request): Promise<Response> {
  const limited = rateLimit(getClientIp(request));
  if (!limited.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }
  const url = new URL(request.url);
  if (url.searchParams.get('cron') === '1') {
    return runCron(request);
  }
  const clientId = request.headers.get('x-client-id');
  if (!clientId) {
    return NextResponse.json({ alerts: [] });
  }
  return NextResponse.json({ alerts: listForClient(clientId) });
}

export async function POST(request: Request): Promise<Response> {
  const csrf = guardMutation(request);
  if (csrf) {
    return csrf;
  }
  const body = await readJson(request);
  const parsed = parseAlertInput(body);
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid alert' }, { status: 400 });
  }
  const clientId = request.headers.get('x-client-id') ?? 'anonymous';
  const stored: StoredAlert = {
    ...parsed,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    clientId,
  };
  alerts.set(stored.id, stored);
  return NextResponse.json({ alert: toPublic(stored) }, { status: 201 });
}

export async function PATCH(request: Request): Promise<Response> {
  const csrf = guardMutation(request);
  if (csrf) {
    return csrf;
  }
  const body = await readJson(request);
  if (!isRecord(body) || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const existing = alerts.get(body.id);
  if (!existing || existing.clientId !== request.headers.get('x-client-id')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const next = applyPatch(existing, body);
  alerts.set(next.id, next);
  return NextResponse.json({ alert: toPublic(next) });
}

export async function DELETE(request: Request): Promise<Response> {
  const csrf = guardMutation(request);
  if (csrf) {
    return csrf;
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const existing = alerts.get(id);
  if (!existing || existing.clientId !== request.headers.get('x-client-id')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  alerts.delete(id);
  return NextResponse.json({ ok: true });
}

function guardMutation(request: Request): Response | null {
  const limited = rateLimit(getClientIp(request));
  if (!limited.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

async function runCron(request: Request): Promise<Response> {
  if (!isCronRequest(request) && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let triggered = 0;
  for (const alert of alerts.values()) {
    if (await isTriggered(alert)) {
      alert.triggered = true;
      alert.triggeredAt = Date.now();
      triggered += 1;
      logger.info('Rate alert triggered', { id: alert.id, pair: alert.pair });
    }
  }
  return NextResponse.json({ checked: alerts.size, triggered });
}

async function isTriggered(alert: StoredAlert): Promise<boolean> {
  const parsed = parsePairKey(alert.pair);
  if (!parsed) {
    return false;
  }
  try {
    const rates = await fetchLatestRates(parsed.from, {
      apiKey: process.env.EXCHANGERATE_API_KEY,
      cacheGet: getCachedRates,
      cacheSet: setCachedRates,
    });
    const rate = rates.rates[parsed.to];
    if (typeof rate !== 'number') {
      return false;
    }
    return alert.direction === 'above' ? rate >= alert.targetRate : rate <= alert.targetRate;
  } catch (error) {
    logger.warn('Alert check failed', { id: alert.id, error: String(error) });
    return false;
  }
}

function listForClient(clientId: string): RateAlert[] {
  return [...alerts.values()].filter((item) => item.clientId === clientId).map(toPublic);
}

function toPublic(alert: StoredAlert): RateAlert {
  const { id, pair, targetRate, direction, createdAt } = alert;
  return { id, pair, targetRate, direction, createdAt };
}

function parseAlertInput(body: unknown): Omit<RateAlert, 'id' | 'createdAt'> | null {
  if (!isRecord(body)) {
    return null;
  }
  if (typeof body.pair !== 'string' || typeof body.targetRate !== 'number') {
    return null;
  }
  if (body.direction !== 'above' && body.direction !== 'below') {
    return null;
  }
  const parsed = parsePairKey(body.pair);
  if (!parsed || !isValidCurrencyCode(parsed.from) || !isValidCurrencyCode(parsed.to)) {
    return null;
  }
  if (!Number.isFinite(body.targetRate) || body.targetRate <= 0) {
    return null;
  }
  return {
    pair: `${parsed.from}-${parsed.to}`,
    targetRate: body.targetRate,
    direction: body.direction,
  };
}

function applyPatch(existing: StoredAlert, body: Record<string, unknown>): StoredAlert {
  const next = { ...existing };
  if (typeof body.targetRate === 'number' && body.targetRate > 0) {
    next.targetRate = body.targetRate;
  }
  if (body.direction === 'above' || body.direction === 'below') {
    next.direction = body.direction;
  }
  return next;
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export { ApiError };
