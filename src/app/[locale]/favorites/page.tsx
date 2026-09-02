'use client';

import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { getCurrency } from '@/lib/currencies';
import { formatRate, parsePairKey } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const favorites = useCurrencyStore((s) => s.favorites);
  const toggleFavorite = useCurrencyStore((s) => s.toggleFavorite);
  const setPair = useCurrencyStore((s) => s.setPair);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      {favorites.length === 0 ? (
        <p className="mt-8 text-sm">{t('empty')}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {favorites.map((pair) => (
            <FavoriteRow
              key={pair}
              pair={pair}
              onRemove={() => toggleFavorite(pair)}
              onOpen={setPair}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

function FavoriteRow({
  pair,
  onRemove,
  onOpen,
}: {
  pair: string;
  onRemove: () => void;
  onOpen: (from: string, to: string) => void;
}) {
  const t = useTranslations('favorites');
  const parsed = parsePairKey(pair);
  const from = parsed?.from ?? 'USD';
  const to = parsed?.to ?? 'EUR';
  const { data } = useExchangeRate(from);
  const rate = data?.rates[to];
  const fromOpt = getCurrency(from);
  const toOpt = getCurrency(to);

  return (
    <li className="bg-card flex items-center justify-between gap-3 rounded-xl border p-4">
      <Link
        href={`/${from.toLowerCase()}-to-${to.toLowerCase()}`}
        className="min-w-0 flex-1"
        onClick={() => onOpen(from, to)}
      >
        <p className="font-semibold">
          {fromOpt?.flag} {from} → {toOpt?.flag} {to}
        </p>
        <p className="text-muted-foreground text-sm">
          {t('rate')}: {typeof rate === 'number' ? formatRate(rate) : '—'}
        </p>
      </Link>
      <Button type="button" variant="ghost" size="icon" aria-label={t('title')} onClick={onRemove}>
        <Star className="fill-amber-400 text-amber-400" aria-hidden />
      </Button>
    </li>
  );
}
