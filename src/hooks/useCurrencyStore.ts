'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_FROM, DEFAULT_TO } from '@/lib/constants';
import { toPairKey } from '@/lib/utils';
import type { RateAlert } from '@/types/currency';

interface CurrencyState {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  favorites: string[];
  alerts: RateAlert[];
  clientId: string;
  setFromCurrency: (code: string) => void;
  setToCurrency: (code: string) => void;
  setAmount: (amount: string) => void;
  setPair: (from: string, to: string) => void;
  swapCurrencies: () => void;
  toggleFavorite: (pair?: string) => void;
  isFavorite: (pair?: string) => boolean;
  addAlert: (alert: Omit<RateAlert, 'id' | 'createdAt'>) => RateAlert;
  updateAlert: (
    id: string,
    patch: Partial<Pick<RateAlert, 'targetRate' | 'direction' | 'pair'>>,
  ) => void;
  removeAlert: (id: string) => void;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      fromCurrency: DEFAULT_FROM,
      toCurrency: DEFAULT_TO,
      amount: '1',
      favorites: ['USD-EUR', 'USD-GBP'],
      alerts: [],
      clientId: createId(),
      setFromCurrency: (code) => set({ fromCurrency: code.toUpperCase() }),
      setToCurrency: (code) => set({ toCurrency: code.toUpperCase() }),
      setAmount: (amount) => set({ amount }),
      setPair: (from, to) =>
        set({ fromCurrency: from.toUpperCase(), toCurrency: to.toUpperCase() }),
      swapCurrencies: () => {
        const { fromCurrency, toCurrency } = get();
        set({ fromCurrency: toCurrency, toCurrency: fromCurrency });
      },
      toggleFavorite: (pair) => {
        const key = pair ?? toPairKey(get().fromCurrency, get().toCurrency);
        const favorites = get().favorites;
        if (favorites.includes(key)) {
          set({ favorites: favorites.filter((item) => item !== key) });
          return;
        }
        set({ favorites: [...favorites, key] });
      },
      isFavorite: (pair) => {
        const key = pair ?? toPairKey(get().fromCurrency, get().toCurrency);
        return get().favorites.includes(key);
      },
      addAlert: (alert) => {
        const next: RateAlert = {
          ...alert,
          id: createId(),
          createdAt: Date.now(),
        };
        set({ alerts: [...get().alerts, next] });
        return next;
      },
      updateAlert: (id, patch) => {
        set({
          alerts: get().alerts.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        });
      },
      removeAlert: (id) => {
        set({ alerts: get().alerts.filter((item) => item.id !== id) });
      },
    }),
    {
      name: 'currencyconv-prefs',
      partialize: (state) => ({
        fromCurrency: state.fromCurrency,
        toCurrency: state.toCurrency,
        amount: state.amount,
        favorites: state.favorites,
        alerts: state.alerts,
        clientId: state.clientId,
      }),
    },
  ),
);
