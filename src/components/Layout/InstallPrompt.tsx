'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INSTALL_DISMISS_KEY } from '@/lib/constants';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Custom A2HS prompt using beforeinstallprompt (not the native mini-infobar alone).
 */
export function InstallPrompt() {
  const t = useTranslations('nav');
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(INSTALL_DISMISS_KEY) === '1') {
        return;
      }
    } catch {
      // ignore
    }
    const onPrompt = (raw: Event): void => {
      raw.preventDefault();
      setEvent(raw as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (hidden || !event) {
    return null;
  }

  return (
    <div className="bg-background fixed bottom-4 left-4 z-40 flex max-w-sm items-center gap-2 rounded-xl border p-3 shadow-lg">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={async () => {
          await event.prompt();
          setHidden(true);
        }}
      >
        <Download className="h-4 w-4" aria-hidden />
        {t('install')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('dismissInstall')}
        onClick={() => {
          try {
            window.localStorage.setItem(INSTALL_DISMISS_KEY, '1');
          } catch {
            // ignore
          }
          setHidden(true);
        }}
      >
        <X aria-hidden />
      </Button>
    </div>
  );
}
