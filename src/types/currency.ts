/** Normalized latest-rate payload used across server and client. */
export interface ExchangeRate {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
  source?: 'exchangerate-api' | 'frankfurter' | 'cache';
}

/** Selectable currency shown in comboboxes. */
export interface CurrencyOption {
  code: string;
  name: string;
  flag: string;
}

/** User-defined threshold notification for a currency pair. */
export interface RateAlert {
  id: string;
  pair: string;
  targetRate: number;
  direction: 'above' | 'below';
  createdAt: number;
}

/** Server-side alert record keyed to an anonymous client id. */
export interface StoredAlert extends RateAlert {
  clientId: string;
  triggered?: boolean;
  triggeredAt?: number;
}

/** One point on the 7-day historical chart. */
export interface HistoricalPoint {
  date: string;
  rate: number;
}

/** Historical series plus percent change over the window. */
export interface HistoricalSeries {
  from: string;
  to: string;
  points: HistoricalPoint[];
  changePercent: number;
}

/** Widget theme query param. */
export type WidgetTheme = 'light' | 'dark';

/** Source used when a rate was obtained. */
export type RateSource = NonNullable<ExchangeRate['source']>;
