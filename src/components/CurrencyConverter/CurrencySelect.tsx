'use client';

import { memo, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CurrencySymbolIcon } from '@/components/CurrencySymbolIcon';
import { CURRENCIES } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import type { CurrencyOption } from '@/types/currency';

interface CurrencySelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
}

function CurrencySelectInner({ id, label, value, onChange }: CurrencySelectProps) {
  const t = useTranslations('converter');
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => CURRENCIES.find((item) => item.code === value), [value]);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-muted-foreground text-sm font-medium">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="h-12 w-full justify-between font-normal"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-lg">
                <CurrencySymbolIcon code={selected?.code ?? value} size={16} />
              </span>
              <span className="font-semibold">{selected?.code ?? value}</span>
              <span className="text-muted-foreground truncate">{selected?.name}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,22rem)] p-0" align="start">
          <Command>
            <CommandInput placeholder={t('searchCurrency')} />
            <CommandList>
              <CommandEmpty>{t('noCurrency')}</CommandEmpty>
              <CommandGroup>
                {CURRENCIES.map((item) => (
                  <CurrencyRow
                    key={item.code}
                    item={item}
                    selected={item.code === value}
                    onSelect={() => {
                      onChange(item.code);
                      setOpen(false);
                    }}
                  />
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function CurrencyRow({
  item,
  selected,
  onSelect,
}: {
  item: CurrencyOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CommandItem value={`${item.code} ${item.name}`} onSelect={onSelect}>
      <span className="bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-md">
        <CurrencySymbolIcon code={item.code} size={14} />
      </span>
      <span className="font-medium">{item.code}</span>
      <span className="text-muted-foreground truncate">{item.name}</span>
      <Check
        className={cn('ml-auto h-4 w-4', selected ? 'opacity-100' : 'opacity-0')}
        aria-hidden
      />
    </CommandItem>
  );
}

export const CurrencySelect = memo(CurrencySelectInner);
