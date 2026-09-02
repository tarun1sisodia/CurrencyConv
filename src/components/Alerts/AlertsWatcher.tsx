'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { parsePairKey } from '@/lib/utils';

/**
 * While the app is open, compares live rates against stored alerts
 * and fires a browser notification when a threshold is crossed.
 */
export function AlertsWatcher() {
  const alerts = useCurrencyStore((s) => s.alerts);
  const bases = Array.from(
    new Set(alerts.map((alert) => parsePairKey(alert.pair)?.from).filter(Boolean)),
  );
  const primary = bases[0] ?? 'USD';
  const { data } = useExchangeRate(primary);

  useEffect(() => {
    if (!data || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }
    for (const alert of alerts) {
      const parsed = parsePairKey(alert.pair);
      if (!parsed || parsed.from !== data.base) {
        continue;
      }
      const rate = data.rates[parsed.to];
      if (typeof rate !== 'number') {
        continue;
      }
      const hit = alert.direction === 'above' ? rate >= alert.targetRate : rate <= alert.targetRate;
      if (hit) {
        new Notification(`${alert.pair} ${rate.toFixed(4)}`, {
          body: `Target ${alert.direction} ${alert.targetRate}`,
        });
      }
    }
  }, [alerts, data]);

  return null;
}
