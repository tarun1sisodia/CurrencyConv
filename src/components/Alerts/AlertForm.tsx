'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencySelect } from '@/components/CurrencyConverter/CurrencySelect';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import { logger } from '@/lib/logger';
import { toPairKey } from '@/lib/utils';

/**
 * Creates a local + server-mirrored rate alert for the selected pair.
 */
export function AlertForm() {
  const t = useTranslations('alerts');
  const fromCurrency = useCurrencyStore((s) => s.fromCurrency);
  const toCurrency = useCurrencyStore((s) => s.toCurrency);
  const setFromCurrency = useCurrencyStore((s) => s.setFromCurrency);
  const setToCurrency = useCurrencyStore((s) => s.setToCurrency);
  const addAlert = useCurrencyStore((s) => s.addAlert);
  const clientId = useCurrencyStore((s) => s.clientId);
  const [target, setTarget] = useState('0.95');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [message, setMessage] = useState('');

  return (
    <form className="bg-card space-y-4 rounded-2xl border p-6" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <CurrencySelect
          id="alert-from"
          label={t('pair')}
          value={fromCurrency}
          onChange={setFromCurrency}
        />
        <CurrencySelect id="alert-to" label=" " value={toCurrency} onChange={setToCurrency} />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t('direction')}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="direction"
            value="above"
            checked={direction === 'above'}
            onChange={() => setDirection('above')}
          />
          {t('above')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="direction"
            value="below"
            checked={direction === 'below'}
            onChange={() => setDirection('below')}
          />
          {t('below')}
        </label>
      </fieldset>
      <div className="space-y-1">
        <Label htmlFor="target">{t('target')}</Label>
        <Input
          id="target"
          inputMode="decimal"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
        />
      </div>
      <p className="text-muted-foreground text-sm">{t('notifyHint')}</p>
      <Button type="submit">{t('create')}</Button>
      {message ? (
        <p className="text-sm" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const targetRate = Number.parseFloat(target);
    if (!Number.isFinite(targetRate) || targetRate <= 0) {
      setMessage(t('invalid'));
      return;
    }
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    const pair = toPairKey(fromCurrency, toCurrency);
    const created = addAlert({ pair, targetRate, direction });
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Id': clientId },
        body: JSON.stringify(created),
      });
    } catch (error) {
      logger.warn('Alert sync failed', { error: String(error) });
    }
    setMessage(t('created'));
  }
}
