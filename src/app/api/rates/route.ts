import { NextResponse } from 'next/server';
import { fetchHistoricalSeries, fetchLatestRates, ApiError } from '@/lib/api';
import { getCachedRates, getStaleRates, setCachedRates } from '@/lib/cache';
import { isValidCurrencyCode } from '@/lib/currencies';
import { logger } from '@/lib/logger';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { normalizeCode } from '@/lib/utils';

export const runtime = 'nodejs';

/**
 * GET /api/rates?base=USD
 * GET /api/rates?base=USD&quote=EUR&history=7
 */
export async function GET(request: Request): Promise<Response> {
  const limited = rateLimit(getClientIp(request));
  if (!limited.success) {
    return rateLimitedResponse(request);
  }
  const url = new URL(request.url);
  const base = normalizeCode(url.searchParams.get('base') ?? 'USD');
  if (!isValidCurrencyCode(base)) {
    return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 });
  }
  const history = url.searchParams.get('history');
  const quote = url.searchParams.get('quote');
  if (history && quote) {
    return handleHistory(base, quote);
  }
  return handleLatest(base);
}

async function handleLatest(base: string): Promise<Response> {
  try {
    const rate = await fetchLatestRates(base, {
      apiKey: process.env.EXCHANGERATE_API_KEY,
      cacheGet: getCachedRates,
      cacheSet: setCachedRates,
    });
    return NextResponse.json(rate, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    return handleRatesError(error, base);
  }
}

async function handleHistory(base: string, quoteRaw: string): Promise<Response> {
  const quote = normalizeCode(quoteRaw);
  if (!isValidCurrencyCode(quote)) {
    return NextResponse.json({ error: 'Invalid quote currency' }, { status: 400 });
  }
  try {
    const series = await fetchHistoricalSeries(base, quote);
    return NextResponse.json(series, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    logger.warn('History fetch failed', { base, quote, error: String(error) });
    const status = error instanceof ApiError ? error.statusCode : 502;
    return NextResponse.json({ error: 'History unavailable' }, { status });
  }
}

function rateLimitedResponse(request: Request): Response {
  const url = new URL(request.url);
  const base = normalizeCode(url.searchParams.get('base') ?? 'USD');
  const cached = getCachedRates(base) ?? getStaleRates(base);
  if (cached) {
    return NextResponse.json({ ...cached, source: 'cache' }, { status: 200 });
  }
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
}

function handleRatesError(error: unknown, base: string): Response {
  logger.error('Rates route failed', { base, error: String(error) });
  const cached = getCachedRates(base) ?? getStaleRates(base);
  if (cached) {
    return NextResponse.json({ ...cached, source: 'cache' });
  }
  const status = error instanceof ApiError ? error.statusCode : 502;
  return NextResponse.json({ error: 'Rates unavailable' }, { status });
}
