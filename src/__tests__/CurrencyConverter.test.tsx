import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SwapButton } from '@/components/CurrencyConverter/SwapButton';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { useCurrencyStore } from '@/hooks/useCurrencyStore';
import en from '@/messages/en.json';

vi.mock('@/hooks/useExchangeRate', () => ({
  useExchangeRate: () => mockRates(),
  useHistoricalRates: () => ({ isLoading: false, data: undefined, isError: false }),
}));

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => true,
}));

let mockRates = (): {
  data: { base: string; rates: Record<string, number>; timestamp: number } | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} => ({
  data: { base: 'USD', rates: { EUR: 0.92, USD: 1 }, timestamp: Date.now() },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
});

function wrapper(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('SwapButton', () => {
  beforeEach(() => {
    useCurrencyStore.setState({ fromCurrency: 'USD', toCurrency: 'EUR' });
    mockRates = () => ({
      data: { base: 'USD', rates: { EUR: 0.92, USD: 1 }, timestamp: Date.now() },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('swaps from/to values in the store', async () => {
    const user = userEvent.setup();
    wrapper(<SwapButton onSwap={() => useCurrencyStore.getState().swapCurrencies()} />);
    await user.click(screen.getByRole('button', { name: /swap currencies/i }));
    expect(useCurrencyStore.getState().fromCurrency).toBe('EUR');
    expect(useCurrencyStore.getState().toCurrency).toBe('USD');
  });
});

describe('CurrencyConverter loading and error', () => {
  it('renders a skeleton while loading', () => {
    mockRates = () => ({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    wrapper(<CurrencyConverter />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders an error message when both APIs fail', () => {
    mockRates = () => ({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    wrapper(<CurrencyConverter />);
    expect(screen.getByRole('alert')).toHaveTextContent(/could not load live rates/i);
  });
});
