'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sanitizeAmountInput } from '@/lib/utils';

interface CurrencyInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Numeric amount field: digits + a single decimal, max 15 digits.
 */
export function CurrencyInput({ id, value, onChange }: CurrencyInputProps) {
  const t = useTranslations('converter');

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-muted-foreground">
        {t('amountLabel')}
      </Label>
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(sanitizeAmountInput(event.target.value))}
        className="focus-visible:ring-ring h-14 border-0 bg-transparent px-0 text-right text-3xl font-semibold shadow-none focus-visible:ring-2"
        aria-describedby={`${id}-hint`}
      />
      <span id={`${id}-hint`} className="sr-only">
        {t('amountLabel')}
      </span>
    </div>
  );
}
