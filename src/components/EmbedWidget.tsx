'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { getBaseUrl } from '@/lib/site';

/**
 * Copy-able iframe snippet plus a live preview of /api/widget.
 */
export function EmbedWidget() {
  const t = useTranslations('embed');
  const from = useCurrencyStore((s) => s.fromCurrency);
  const to = useCurrencyStore((s) => s.toCurrency);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [copied, setCopied] = useState(false);
  const src = useMemo(() => {
    const origin = typeof window === 'undefined' ? getBaseUrl() : window.location.origin;
    return `${origin}/api/widget?theme=${theme}&pair=${from}-${to}`;
  }, [from, theme, to]);
  const snippet = `<iframe src="${src}" title="Currency converter" width="360" height="240" style="border:0;border-radius:16px;" loading="lazy"></iframe>`;

  return (
    <section className="bg-card space-y-4 rounded-2xl border p-6" aria-labelledby="embed-heading">
      <div>
        <h2 id="embed-heading" className="text-xl font-semibold">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      </div>
      <fieldset className="flex gap-4 text-sm">
        <legend className="sr-only">{t('theme')}</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="widget-theme"
            checked={theme === 'light'}
            onChange={() => setTheme('light')}
          />
          {t('light')}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="widget-theme"
            checked={theme === 'dark'}
            onChange={() => setTheme('dark')}
          />
          {t('dark')}
        </label>
      </fieldset>
      <iframe
        src={src}
        title="Currency converter"
        className="h-60 w-full max-w-sm rounded-2xl border"
      />
      <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-xs">{snippet}</pre>
      <Button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(snippet);
          setCopied(true);
        }}
      >
        {copied ? t('copied') : t('copy')}
      </Button>
    </section>
  );
}
