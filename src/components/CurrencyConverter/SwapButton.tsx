'use client';

import { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SwapButtonProps {
  onSwap: () => void;
}

/**
 * Circular swap control with a 180° rotation animation.
 */
export function SwapButton({ onSwap }: SwapButtonProps) {
  const t = useTranslations('converter');
  const [spins, setSpins] = useState(0);

  return (
    <div className="flex items-center justify-center py-1 md:px-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={t('swap')}
        className="h-11 w-11 rounded-full shadow-sm"
        onClick={() => {
          setSpins((count) => count + 1);
          onSwap();
        }}
      >
        <ArrowDownUp
          className={cn('h-5 w-5 transition-transform duration-300')}
          style={{ transform: `rotate(${spins * 180}deg)` }}
          aria-hidden
        />
      </Button>
    </div>
  );
}
