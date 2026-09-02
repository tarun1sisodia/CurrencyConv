import { describe, expect, it, vi } from 'vitest';
import { fetchLatestRates } from '@/lib/api';

describe('fetchLatestRates fallback', () => {
  it('falls back to Frankfurter when the primary API returns 500', async () => {
    const fetchFn = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('exchangerate-api.com') || url.includes('open.er-api.com')) {
        return new Response(JSON.stringify({ result: 'error' }), { status: 500 });
      }
      return new Response(
        JSON.stringify({
          base: 'USD',
          date: '2024-01-01',
          rates: { EUR: 0.92 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as unknown as typeof fetch;

    const result = await fetchLatestRates('USD', { fetchFn, apiKey: 'test-key' });
    expect(result.rates.EUR).toBe(0.92);
    expect(result.source).toBe('frankfurter');
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
