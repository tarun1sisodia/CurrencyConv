'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CurrencyInput } from '@/components/CurrencyConverter/CurrencyInput';
import { CurrencySelect } from '@/components/CurrencyConverter/CurrencySelect';
import { RateDisplay } from '@/components/CurrencyConverter/RateDisplay';
import { SwapButton } from '@/components/CurrencyConverter/SwapButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toPairKey } from '@/lib/utils';

/**
 * Main converter card: amount, pair selectors, live result.
 */
export function CurrencyConverter() {
  const t = useTranslations('converter');
  const fromCurrency = useCurrencyStore((s) => s.fromCurrency);
  const toCurrency = useCurrencyStore((s) => s.toCurrency);
  const amount = useCurrencyStore((s) => s.amount);
  const setFromCurrency = useCurrencyStore((s) => s.setFromCurrency);
  const setToCurrency = useCurrencyStore((s) => s.setToCurrency);
  const setAmount = useCurrencyStore((s) => s.setAmount);
  const swapCurrencies = useCurrencyStore((s) => s.swapCurrencies);
  const toggleFavorite = useCurrencyStore((s) => s.toggleFavorite);
  const favorites = useCurrencyStore((s) => s.favorites);
  const debouncedFrom = useDebouncedValue(fromCurrency);
  const { data, isLoading, isError, refetch } = useExchangeRate(debouncedFrom);
  const online = useOnlineStatus();
  const pair = toPairKey(fromCurrency, toCurrency);
  const starred = favorites.includes(pair);
  const rate = data?.rates[toCurrency];
  const isStale = data?.source === 'cache' || !online;

  return (
    <article className="mx-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-900">
      <div className="flex min-h-[420px] flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <CurrencyInput id="amount" value={amount} onChange={setAmount} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-pressed={starred}
            aria-label={starred ? t('unstar') : t('star')}
            onClick={() => toggleFavorite(pair)}
          >
            <Star className={starred ? 'fill-amber-400 text-amber-400' : ''} aria-hidden />
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-end">
          <div className="min-w-0 flex-1">
            <CurrencySelect
              id="from-currency"
              label={t('fromLabel')}
              value={fromCurrency}
              onChange={setFromCurrency}
            />
          </div>
          <SwapButton onSwap={swapCurrencies} />
          <div className="min-w-0 flex-1">
            <CurrencySelect
              id="to-currency"
              label={t('toLabel')}
              value={toCurrency}
              onChange={setToCurrency}
            />
          </div>
        </div>
        {isLoading && !data ? <ConverterSkeleton label={t('loading')} /> : null}
        {isError && !data ? (
          <div role="alert" className="border-destructive/40 rounded-lg border p-4 text-sm">
            <p>{t('error')}</p>
            <Button type="button" className="mt-3" size="sm" onClick={() => void refetch()}>
              {t('retry')}
            </Button>
          </div>
        ) : null}
        {data ? (
          <RateDisplay
            amount={amount}
            from={fromCurrency}
            to={toCurrency}
            rate={rate}
            timestamp={data.timestamp}
            isStale={Boolean(isStale)}
          />
        ) : null}
      </div>
    </article>
  );
}

function ConverterSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
