'use client';

import dynamic from 'next/dynamic';

const RateChart = dynamic(() => import('@/components/RateChart').then((mod) => mod.RateChart), {
  ssr: false,
  loading: () => <div className="bg-muted h-56 animate-pulse rounded-2xl" />,
});

const MultiCurrencyTable = dynamic(
  () => import('@/components/MultiCurrencyTable').then((mod) => mod.MultiCurrencyTable),
  { ssr: false, loading: () => <div className="bg-muted h-64 animate-pulse rounded-2xl" /> },
);

const EmbedWidget = dynamic(
  () => import('@/components/EmbedWidget').then((mod) => mod.EmbedWidget),
  {
    ssr: false,
  },
);

/**
 * Client island for below-the-fold charts, table, and widget (ssr: false).
 */
export function HomeBelowFold() {
  return (
    <>
      <RateChart />
      <MultiCurrencyTable />
      <EmbedWidget />
    </>
  );
}
