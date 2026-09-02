'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const t = useTranslations('common');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto max-w-lg flex-1 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">{t('errorTitle')}</h1>
      <p className="text-muted-foreground mt-2">{t('errorBody')}</p>
      <Button className="mt-6" type="button" onClick={() => reset()}>
        {t('retry')}
      </Button>
    </main>
  );
}
