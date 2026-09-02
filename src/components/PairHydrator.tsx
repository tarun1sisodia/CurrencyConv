'use client';

import { useEffect } from 'react';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';

interface PairHydratorProps {
  from: string;
  to: string;
}

/**
 * Syncs the Zustand pair with a SEO landing page's from/to params.
 */
export function PairHydrator({ from, to }: PairHydratorProps) {
  const setPair = useCurrencyStore((s) => s.setPair);

  useEffect(() => {
    setPair(from, to);
  }, [from, setPair, to]);

  return null;
}
