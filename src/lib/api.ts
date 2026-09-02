import { FETCH_TIMEOUT_MS, HISTORY_DAYS } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { isNumberRecord, isRecord, normalizeCode } from '@/lib/utils';
import type { ExchangeRate, HistoricalPoint, HistoricalSeries } from '@/types/currency';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface FetchRatesOptions {
  fetchFn?: typeof fetch;
  apiKey?: string;
  cacheGet?: (base: string) => ExchangeRate | undefined;
  cacheSet?: (base: string, value: ExchangeRate) => void;
}

interface ExchangeRateApiBody {
  result?: string;
  'error-type'?: string;
  base_code?: string;
  time_last_update_unix?: number;
  conversion_rates?: Record<string, number>;
  rates?: Record<string, number>;
}

/**
 * Fetches latest rates with ExchangeRate-API → Frankfurter → cache fallback.
 */
export async function fetchLatestRates(
  base: string,
  options: FetchRatesOptions = {},
): Promise<ExchangeRate> {
  const fetchFn = options.fetchFn ?? fetch;
  const apiKey = options.apiKey;
  const normalized = normalizeCode(base);
  try {
    const primary = await fetchFromExchangeRateApi(normalized, apiKey, fetchFn);
    options.cacheSet?.(normalized, primary);
    return primary;
  } catch (primaryError) {
    logger.warn('Primary FX API failed', { base: normalized, error: String(primaryError) });
    try {
      const fallback = await fetchFromFrankfurter(normalized, fetchFn);
      options.cacheSet?.(normalized, fallback);
      return fallback;
    } catch (fallbackError) {
      logger.warn('Fallback FX API failed', { base: normalized, error: String(fallbackError) });
      const cached = options.cacheGet?.(normalized);
      if (cached) {
        return { ...cached, source: 'cache' };
      }
      return buildStaticFallback(normalized);
    }
  }
}

/**
 * Calls ExchangeRate-API (authenticated) or the open endpoint.
 */
export async function fetchFromExchangeRateApi(
  base: string,
  apiKey: string | undefined,
  fetchFn: typeof fetch = fetch,
): Promise<ExchangeRate> {
  const url = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`
    : `https://open.er-api.com/v6/latest/${base}`;
  const response = await fetchWithTimeout(url, { next: { revalidate: 3600 } }, fetchFn);
  if (response.status === 401 || response.status === 403) {
    throw new ApiError('Invalid API key', 401, 'INVALID_KEY');
  }
  if (response.status === 429) {
    throw new ApiError('Upstream rate limited', 429, 'UPSTREAM_429');
  }
  if (!response.ok) {
    throw new ApiError(`Primary API HTTP ${response.status}`, response.status, 'PRIMARY_HTTP');
  }
  const json: unknown = await response.json();
  const body = parseExchangeRateApi(json);
  if (body.result === 'error') {
    const status = body['error-type'] === 'invalid-key' ? 401 : 502;
    throw new ApiError(body['error-type'] ?? 'Primary API error', status, 'PRIMARY_ERROR');
  }
  const rates = body.conversion_rates ?? body.rates;
  if (!rates) {
    throw new ApiError('Primary API missing rates', 502, 'PRIMARY_SHAPE');
  }
  return {
    base: body.base_code ?? base,
    rates,
    timestamp: (body.time_last_update_unix ?? Math.floor(Date.now() / 1000)) * 1000,
    source: 'exchangerate-api',
  };
}

/**
 * Calls the open-source Frankfurter (ECB) API.
 */
export async function fetchFromFrankfurter(
  base: string,
  fetchFn: typeof fetch = fetch,
): Promise<ExchangeRate> {
  const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`;
  const response = await fetchWithTimeout(url, { next: { revalidate: 3600 } }, fetchFn);
  if (!response.ok) {
    throw new ApiError(`Frankfurter HTTP ${response.status}`, response.status, 'FRANKFURTER_HTTP');
  }
  const json: unknown = await response.json();
  if (!isFrankfurterLatest(json)) {
    throw new ApiError('Frankfurter payload invalid', 502, 'FRANKFURTER_SHAPE');
  }
  const timestamp = json.date ? Date.parse(`${json.date}T00:00:00Z`) : Date.now();
  return {
    base: json.base,
    rates: { ...json.rates, [json.base]: 1 },
    timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
    source: 'frankfurter',
  };
}

/**
 * Loads a 7-day history series from Frankfurter.
 */
export async function fetchHistoricalSeries(
  from: string,
  to: string,
  days = HISTORY_DAYS,
  fetchFn: typeof fetch = fetch,
): Promise<HistoricalSeries> {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - days);
  const startIso = start.toISOString().slice(0, 10);
  const endIso = end.toISOString().slice(0, 10);
  const url = `https://api.frankfurter.app/${startIso}..${endIso}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const response = await fetchWithTimeout(url, { next: { revalidate: 3600 } }, fetchFn);
  if (!response.ok) {
    throw new ApiError(`History HTTP ${response.status}`, response.status, 'HISTORY_HTTP');
  }
  const json: unknown = await response.json();
  const points = parseHistorical(json, to);
  if (points.length === 0) {
    throw new ApiError('History empty', 404, 'HISTORY_EMPTY');
  }
  const first = points[0]?.rate ?? 0;
  const last = points[points.length - 1]?.rate ?? 0;
  const changePercent = first === 0 ? 0 : ((last - first) / first) * 100;
  return { from, to, points, changePercent };
}

/**
 * fetch() wrapper that aborts after FETCH_TIMEOUT_MS.
 */
type FetchInit = RequestInit & { next?: { revalidate?: number } };

export async function fetchWithTimeout(
  url: string,
  init: FetchInit = {},
  fetchFn: typeof fetch = fetch,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetchFn(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseExchangeRateApi(value: unknown): ExchangeRateApiBody {
  if (!isRecord(value)) {
    throw new ApiError('Primary API payload invalid', 502, 'PRIMARY_SHAPE');
  }
  const rates = value.conversion_rates ?? value.rates;
  if (rates !== undefined && !isNumberRecord(rates)) {
    throw new ApiError('Primary API rates invalid', 502, 'PRIMARY_SHAPE');
  }
  return value as ExchangeRateApiBody;
}

function isFrankfurterLatest(
  value: unknown,
): value is { base: string; date?: string; rates: Record<string, number> } {
  return isRecord(value) && typeof value.base === 'string' && isNumberRecord(value.rates);
}

/** Indicative USD-quoted mid-market snapshot used when every network source fails. */
const USD_FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 149.5,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  HKD: 7.78,
  NZD: 1.66,
  SEK: 10.4,
  NOK: 10.6,
  DKK: 6.86,
  SGD: 1.34,
  INR: 83.5,
  MXN: 17.1,
  BRL: 5.05,
  ZAR: 18.2,
  KRW: 1350,
  TRY: 32.4,
  PLN: 3.95,
  THB: 35.2,
  IDR: 15800,
  PHP: 57.5,
  MYR: 4.47,
  AED: 3.67,
  SAR: 3.75,
  TWD: 32.1,
  VND: 25400,
  CZK: 22.8,
  HUF: 355,
  ILS: 3.7,
  CLP: 930,
  ARS: 900,
  EGP: 48.5,
  NGN: 1550,
  PKR: 278,
  BDT: 110,
  KWD: 0.31,
  QAR: 3.64,
  OMR: 0.385,
  BHD: 0.377,
  JOD: 0.709,
  RON: 4.57,
  BGN: 1.8,
};

/**
 * Builds a full rate table for `base` from the static USD snapshot.
 */
function buildStaticFallback(base: string): ExchangeRate {
  const usdToBase = USD_FALLBACK_RATES[base] ?? 1;
  const rates: Record<string, number> = {};
  for (const [code, usdRate] of Object.entries(USD_FALLBACK_RATES)) {
    rates[code] = usdRate / usdToBase;
  }
  rates[base] = 1;
  logger.warn('Serving static fallback rates', { base });
  return { base, rates, timestamp: Date.now(), source: 'cache' };
}

function parseHistorical(value: unknown, quote: string): HistoricalPoint[] {
  if (!isRecord(value) || !isRecord(value.rates)) {
    return [];
  }
  const points: HistoricalPoint[] = [];
  for (const [date, dayRates] of Object.entries(value.rates)) {
    if (!isRecord(dayRates)) {
      continue;
    }
    const rate = dayRates[quote];
    if (typeof rate === 'number' && Number.isFinite(rate)) {
      points.push({ date, rate });
    }
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}
