'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { useHistoricalRates } from '@/hooks/useExchangeRate';
import { FRANKFURTER_CURRENCIES } from '@/lib/currencies';
import { cn } from '@/lib/utils';

/**
 * 7-day line chart of the selected pair using Frankfurter history.
 */
export function RateChart() {
  const t = useTranslations('chart');
  const locale = useLocale();
  const from = useCurrencyStore((s) => s.fromCurrency);
  const to = useCurrencyStore((s) => s.toCurrency);
  const supported = FRANKFURTER_CURRENCIES.has(from) && FRANKFURTER_CURRENCIES.has(to);
  const { data, isLoading, isError } = useHistoricalRates(from, to);
  const positive = (data?.changePercent ?? 0) >= 0;

  return (
    <section className="bg-card rounded-2xl border p-6 shadow-sm" aria-labelledby="chart-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 id="chart-heading" className="text-xl font-semibold">
          {t('title')}
        </h2>
        {data ? (
          <p className={cn('text-sm font-medium', positive ? 'text-emerald-600' : 'text-rose-600')}>
            {t('change', {
              value: new Intl.NumberFormat(locale, {
                signDisplay: 'exceptZero',
                maximumFractionDigits: 2,
              }).format(data.changePercent),
            })}
          </p>
        ) : null}
      </div>
      {!supported || isError ? (
        <p className="text-muted-foreground text-sm">{t('unavailable')}</p>
      ) : null}
      {isLoading ? (
        <div
          className="bg-muted h-56 animate-pulse rounded-xl"
          role="status"
          aria-label={t('loading')}
        />
      ) : null}
      {data && !isError ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.points}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} width={64} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={positive ? '#059669' : '#e11d48'}
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}
