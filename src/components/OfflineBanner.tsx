'use client';

import { useTranslations } from 'next-intl';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Visible when navigator.onLine is false.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const t = useTranslations('offline');
  if (online) {
    return null;
  }
  return (
    <div
      role="status"
      className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950 dark:bg-amber-900 dark:text-amber-50"
    >
      <WifiOff className="mr-2 inline h-4 w-4" aria-hidden />
      {t('message')}
    </div>
  );
}
