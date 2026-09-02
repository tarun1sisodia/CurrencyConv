'use client';

import { memo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { RESULT_PRECISION } from '@/lib/constants';
import { calculateConversion, formatRate, formatTimeAgo, parseAmount } from '@/lib/utils';

interface RateDisplayProps {
  amount: string;
  from: string;
  to: string;
  rate: number | undefined;
  timestamp: number | undefined;
  isStale: boolean;
}

function RateDisplayInner({ amount, from, to, rate, timestamp, isStale }: RateDisplayProps) {
  const t = useTranslations('converter');
  const locale = useLocale();
  const numeric = parseAmount(amount);
  const converted =
    typeof rate === 'number' ? calculateConversion(numeric, rate, RESULT_PRECISION) : 0;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: RESULT_PRECISION,
    maximumFractionDigits: RESULT_PRECISION,
  }).format(converted);

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">{t('resultLabel')}</p>
      <p
        className="text-4xl font-bold text-indigo-600 dark:text-indigo-400"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatted} {to}
      </p>
      <p className="text-muted-foreground text-sm">
        {t('rateLine', {
          from,
          to,
          rate: typeof rate === 'number' ? formatRate(rate, locale) : '—',
        })}
      </p>
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        {timestamp ? <span>{t('updated', { time: formatTimeAgo(timestamp, locale) })}</span> : null}
        {isStale ? (
          <Badge variant="warning" aria-label={t('outdated')}>
            {t('outdated')}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export const RateDisplay = memo(RateDisplayInner);
