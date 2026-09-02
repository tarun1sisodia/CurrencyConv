'use client';

import { useQuery } from '@tanstack/react-query';
import { HISTORY_DAYS, REFETCH_INTERVAL_MS } from '@/lib/constants';
import { readLocalRates, writeLocalRates } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { isNumberRecord, isRecord } from '@/lib/utils';
import type { ExchangeRate, HistoricalSeries } from '@/types/currency';

interface RatesResponse {
  rate: ExchangeRate;
}

/**
 * Loads latest rates for `base` via the server route, with localStorage fallback.
 */
export function useExchangeRate(base: string) {
  return useQuery({
    queryKey: ['rates', base],
    queryFn: async (): Promise<ExchangeRate> => {
      try {
        const response = await fetch(`/api/rates?base=${encodeURIComponent(base)}`, {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`Rates HTTP ${response.status}`);
        }
        const json: unknown = await response.json();
        const rate = unwrapRate(json);
        writeLocalRates(rate);
        return rate;
      } catch (error) {
        const cached = readLocalRates(base);
        if (cached) {
          logger.warn('Serving localStorage rates after fetch failure', { base });
          return { ...cached, source: 'cache' };
        }
        throw error;
      }
    },
    staleTime: REFETCH_INTERVAL_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    retry: 1,
  });
}

/**
 * Loads 7-day history for a pair (Frankfurter via the rates route).
 */
export function useHistoricalRates(from: string, to: string) {
  return useQuery({
    queryKey: ['history', from, to],
    queryFn: async (): Promise<HistoricalSeries> => {
      const params = new URLSearchParams({
        base: from,
        quote: to,
        history: String(HISTORY_DAYS),
      });
      const response = await fetch(`/api/rates?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`History HTTP ${response.status}`);
      }
      const json: unknown = await response.json();
      if (!isHistoricalSeries(json)) {
        throw new Error('Invalid history payload');
      }
      return json;
    },
    staleTime: REFETCH_INTERVAL_MS,
    retry: 0,
  });
}

function unwrapRate(json: unknown): ExchangeRate {
  if (isExchangeRate(json)) {
    return json;
  }
  if (isRecord(json) && isExchangeRate(json.rate)) {
    return json.rate;
  }
  throw new Error('Invalid rates payload');
}

function isExchangeRate(value: unknown): value is ExchangeRate {
  return (
    isRecord(value) &&
    typeof value.base === 'string' &&
    typeof value.timestamp === 'number' &&
    isNumberRecord(value.rates)
  );
}

function isHistoricalSeries(value: unknown): value is HistoricalSeries {
  if (!isRecord(value) || !Array.isArray(value.points)) {
    return false;
  }
  return typeof value.from === 'string' && typeof value.to === 'string';
}

export type { RatesResponse };
