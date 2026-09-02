/** In-memory / ISR cache lifetime for FX payloads, in seconds. */
export const CACHE_TTL = 3600;

/** Amount input debounce. */
export const DEBOUNCE_MS = 300;

/** Maximum convertible amount (inclusive). */
export const MAX_AMOUNT = 999_999_999_999;

/** Minimum convertible amount. */
export const MIN_AMOUNT = 0;

/** Display precision for converted results. */
export const RESULT_PRECISION = 4;

/** Display precision for the 1-unit rate line. */
export const RATE_PRECISION = 4;

/** Maximum numeric digits allowed in the amount field. */
export const MAX_INPUT_DIGITS = 15;

/** TanStack Query stale time / background refetch interval. */
export const REFETCH_INTERVAL_MS = 1000 * 60 * 60;

/** Rolling window for the IP rate limiter. */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** Max API requests per IP per window. */
export const MAX_REQUESTS_PER_MINUTE = 30;

/** Historical chart lookback. */
export const HISTORY_DAYS = 7;

/** Upstream fetch timeout. */
export const FETCH_TIMEOUT_MS = 8_000;

/** localStorage key for last-known rates (offline fallback). */
export const RATES_STORAGE_KEY = 'currencyconv.rates.v1';

/** localStorage key for cookie-consent choice. */
export const CONSENT_STORAGE_KEY = 'currencyconv.cookie-consent';

/** localStorage key for dismissed PWA install prompt. */
export const INSTALL_DISMISS_KEY = 'currencyconv.install-dismissed';

/** Custom event dispatched when cookie consent changes. */
export const CONSENT_EVENT = 'currencyconv-consent';

/** Default converter pair. */
export const DEFAULT_FROM = 'USD';
export const DEFAULT_TO = 'EUR';

/** Site brand used in metadata and JSON-LD. */
export const SITE_NAME = 'CurrencyConv';

/** How many popular quote currencies the multi-currency table shows. */
export const TABLE_QUOTE_COUNT = 10;
