'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * Registers the production service worker for the offline shell.
 */
export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    if (!('serviceWorker' in navigator)) {
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      logger.warn('Service worker registration failed', { error: String(error) });
    });
  }, []);
  return null;
}
