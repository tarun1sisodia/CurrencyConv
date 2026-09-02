'use client';

import { useSyncExternalStore } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CONSENT_EVENT, CONSENT_STORAGE_KEY } from '@/lib/constants';

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === 'analytics';
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Loads Vercel Analytics + Web Vitals only after analytics consent.
 */
export function AnalyticsGate() {
  const allowed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!allowed) {
    return null;
  }
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
