'use client';

import { useTranslations } from 'next-intl';
import { CurrencySymbolIcon } from '@/components/CurrencySymbolIcon';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { getCurrency, POPULAR_PAIRS } from '@/lib/currencies';
import { Link } from '@/i18n/navigation';

/**
 * Eight popular pair cards that fill the converter on click.
 */
export function PopularPairs() {
  const t = useTranslations('popular');
  const setPair = useCurrencyStore((s) => s.setPair);

  return (
    <section className="space-y-4" aria-labelledby="popular-heading">
      <div>
        <h2 id="popular-heading" className="text-xl font-semibold">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {POPULAR_PAIRS.map(([from, to]) => {
          const fromOpt = getCurrency(from);
          const toOpt = getCurrency(to);
          return (
            <Link
              key={`${from}-${to}`}
              href={`/${from.toLowerCase()}-to-${to.toLowerCase()}`}
              onClick={() => setPair(from, to)}
              className="bg-card focus-visible:ring-ring rounded-xl border p-4 text-left shadow-sm transition hover:border-indigo-400 focus-visible:ring-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg">
                    <CurrencySymbolIcon code={from} size={15} />
                  </span>
                  <p className="text-lg font-semibold">
                    {from}/{to}
                  </p>
                </div>
                <span className="bg-muted text-muted-foreground flex h-7 w-7 items-center justify-center rounded-lg">
                  <CurrencySymbolIcon code={to} size={15} />
                </span>
              </div>
              <p className="text-muted-foreground mt-1 truncate text-xs">
                {fromOpt?.name} → {toOpt?.name}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
