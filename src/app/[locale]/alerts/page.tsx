'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';

const AlertForm = dynamic(
  () => import('@/components/Alerts/AlertForm').then((mod) => mod.AlertForm),
  {
    ssr: false,
  },
);

export default function AlertsPage() {
  const t = useTranslations('alerts');
  const alerts = useCurrencyStore((s) => s.alerts);
  const removeAlert = useCurrencyStore((s) => s.removeAlert);
  const clientId = useCurrencyStore((s) => s.clientId);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>
      <AlertForm />
      {alerts.length === 0 ? (
        <p className="text-sm">{t('empty')}</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="bg-card flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <p className="font-semibold">{alert.pair}</p>
                <p className="text-muted-foreground text-sm">
                  {alert.direction === 'above' ? t('above') : t('below')} {alert.targetRate}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  removeAlert(alert.id);
                  void fetch(`/api/alerts?id=${encodeURIComponent(alert.id)}`, {
                    method: 'DELETE',
                    headers: { 'X-Client-Id': clientId },
                  });
                }}
              >
                {t('delete')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
