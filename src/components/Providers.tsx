'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnalyticsGate } from '@/components/AnalyticsGate';
import { AlertsWatcher } from '@/components/Alerts/AlertsWatcher';
import { REFETCH_INTERVAL_MS } from '@/lib/constants';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Client providers: theme, React Query, tooltips, optional analytics.
 */
export function Providers({ children }: ProvidersProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: REFETCH_INTERVAL_MS,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={client}>
        <TooltipProvider delayDuration={200}>
          {children}
          <AnalyticsGate />
          <AlertsWatcher />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
