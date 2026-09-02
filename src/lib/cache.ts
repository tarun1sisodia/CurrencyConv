import { CACHE_TTL, RATES_STORAGE_KEY } from '@/lib/constants';
import { isNumberRecord, isRecord } from '@/lib/utils';
import type { ExchangeRate } from '@/types/currency';

interface CacheEntry {
  value: ExchangeRate;
  expiresAt: number;
}

const memory = new Map<string, CacheEntry>();

/**
 * Reads a still-fresh in-memory rate payload for `base`.
 */
export function getCachedRates(base: string): ExchangeRate | undefined {
  const entry = memory.get(base.toUpperCase());
  if (!entry) {
    return undefined;
  }
  if (Date.now() > entry.expiresAt) {
    memory.delete(base.toUpperCase());
    return undefined;
  }
  return entry.value;
}

/**
 * Stores a rate payload in the in-memory TTL cache.
 */
export function setCachedRates(base: string, value: ExchangeRate, ttlSeconds = CACHE_TTL): void {
  memory.set(base.toUpperCase(), {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Returns a stale in-memory payload even after expiry (emergency fallback).
 */
export function getStaleRates(base: string): ExchangeRate | undefined {
  return memory.get(base.toUpperCase())?.value;
}

/**
 * Reads last-known rates from localStorage (browser only).
 */
export function readLocalRates(base: string): ExchangeRate | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(RATES_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return null;
    }
    const entry = parsed[base.toUpperCase()];
    return isExchangeRate(entry) ? entry : null;
  } catch {
    return null;
  }
}

/**
 * Persists a rate payload into the localStorage emergency cache.
 */
export function writeLocalRates(rate: ExchangeRate): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const raw = window.localStorage.getItem(RATES_STORAGE_KEY);
    const parsed: Record<string, ExchangeRate> = raw
      ? (JSON.parse(raw) as Record<string, ExchangeRate>)
      : {};
    parsed[rate.base.toUpperCase()] = rate;
    window.localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Quota or private-mode failures are non-fatal.
  }
}

/**
 * Narrows unknown JSON into an ExchangeRate.
 */
function isExchangeRate(value: unknown): value is ExchangeRate {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.base === 'string' &&
    typeof value.timestamp === 'number' &&
    isNumberRecord(value.rates)
  );
}
