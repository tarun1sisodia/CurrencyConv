'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CONSENT_EVENT, CONSENT_STORAGE_KEY } from '@/lib/constants';

type ConsentValue = 'analytics' | 'necessary';

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function getConsentSnapshot(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return 'necessary';
  }
}

function getServerSnapshot(): string | null {
  return 'necessary';
}

/**
 * EU/UK-style banner. Functional localStorage does not require consent;
 * analytics cookies only set after explicit accept.
 */
export function CookieConsentBanner() {
  const t = useTranslations('cookie');
  const stored = useSyncExternalStore(subscribe, getConsentSnapshot, getServerSnapshot);
  const visible = stored === null;

  const choose = useCallback((value: ConsentValue): void => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
      // ignore quota
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-body"
      className="bg-background fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-lg rounded-xl border p-4 shadow-xl"
    >
      <h2 id="cookie-title" className="text-sm font-semibold">
        {t('title')}
      </h2>
      <p id="cookie-body" className="text-muted-foreground mt-1 text-sm">
        {t('body')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => choose('analytics')}>
          {t('accept')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => choose('necessary')}>
          {t('reject')}
        </Button>
      </div>
    </div>
  );
}
