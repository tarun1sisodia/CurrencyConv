'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CurrencySymbolIcon } from '@/components/CurrencySymbolIcon';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { getCurrency, TABLE_CURRENCIES } from '@/lib/currencies';
import { calculateConversion, parseAmount } from '@/lib/utils';

type SortKey = 'code' | 'name' | 'amount';

/**
 * 1-to-10 conversion table for popular quote currencies, sortable.
 */
export function MultiCurrencyTable() {
  const t = useTranslations('table');
  const locale = useLocale();
  const from = useCurrencyStore((s) => s.fromCurrency);
  const amount = useCurrencyStore((s) => s.amount);
  const { data } = useExchangeRate(from);
  const [sort, setSort] = useState<SortKey>('code');
  const numeric = parseAmount(amount);

  const rows = useMemo(() => {
    const list = TABLE_CURRENCIES.filter((code) => code !== from).map((code) => {
      const option = getCurrency(code);
      const rate = data?.rates[code] ?? 0;
      return {
        code,
        name: option?.name ?? code,
        flag: option?.flag ?? '',
        amount: calculateConversion(numeric, rate, 4),
      };
    });
    return list.sort((a, b) => {
      if (sort === 'amount') {
        return b.amount - a.amount;
      }
      if (sort === 'name') {
        return a.name.localeCompare(b.name);
      }
      return a.code.localeCompare(b.code);
    });
  }, [data, from, numeric, sort]);

  return (
    <section className="bg-card rounded-2xl border p-6 shadow-sm" aria-labelledby="table-heading">
      <h2 id="table-heading" className="mb-4 text-xl font-semibold">
        {t('title')}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr>
              <SortHeader label={t('code')} column="code" sort={sort} onSort={setSort} />
              <SortHeader label={t('currency')} column="name" sort={sort} onSort={setSort} />
              <SortHeader label={t('amount')} column="amount" sort={sort} onSort={setSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} className="border-t">
                <td className="py-2 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-md">
                      <CurrencySymbolIcon code={row.code} size={14} />
                    </span>
                    <span>{row.code}</span>
                  </div>
                </td>
                <td className="py-2">{row.name}</td>
                <td className="py-2 tabular-nums">
                  {new Intl.NumberFormat(locale, {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  }).format(row.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
}: {
  label: string;
  column: SortKey;
  sort: SortKey;
  onSort: (key: SortKey) => void;
}) {
  const t = useTranslations('table');
  return (
    <th className="py-2">
      <button
        type="button"
        className="focus-visible:ring-ring font-semibold underline-offset-4 hover:underline focus-visible:ring-2"
        aria-label={t('sort', { column: label })}
        onClick={() => onSort(column)}
      >
        {label}
        {sort === column ? ' ↕' : ''}
      </button>
    </th>
  );
}
