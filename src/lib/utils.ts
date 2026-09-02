import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MAX_AMOUNT, MAX_INPUT_DIGITS, MIN_AMOUNT, RATE_PRECISION } from '@/lib/constants';

/**
 * Merges Tailwind class names, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats an amount as a locale-aware currency string.
 */
export function formatCurrency(amount: number, currency: string, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Multiplies amount by rate and rounds to `precision` decimal places.
 */
export function calculateConversion(amount: number, rate: number, precision = 2): number {
  if (!Number.isFinite(amount) || !Number.isFinite(rate)) {
    return 0;
  }
  const factor = 10 ** precision;
  return Math.round(amount * rate * factor) / factor;
}

/**
 * Formats a mid-market unit rate with a fixed number of decimals.
 */
export function formatRate(value: number, locale = 'en', precision = RATE_PRECISION): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

/**
 * Strips illegal characters from the amount field (digits + one decimal).
 */
export function sanitizeAmountInput(raw: string): string {
  let next = '';
  let hasDot = false;
  let digits = 0;
  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      if (digits >= MAX_INPUT_DIGITS) {
        continue;
      }
      next += char;
      digits += 1;
      continue;
    }
    if (char === '.' && !hasDot) {
      hasDot = true;
      next += char;
    }
  }
  if (next === '.') {
    return '0.';
  }
  const numeric = Number.parseFloat(next);
  if (Number.isFinite(numeric) && numeric > MAX_AMOUNT) {
    return String(MAX_AMOUNT);
  }
  return next;
}

/**
 * Parses a sanitized amount string into a finite number in range.
 */
export function parseAmount(value: string): number {
  if (!value) {
    return MIN_AMOUNT;
  }
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < MIN_AMOUNT) {
    return MIN_AMOUNT;
  }
  return parsed > MAX_AMOUNT ? MAX_AMOUNT : parsed;
}

/**
 * Returns a relative time string for a unix-ms timestamp.
 */
export function formatTimeAgo(timestamp: number, locale = 'en'): string {
  const diffSec = Math.round((timestamp - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffSec);
  if (abs < 60) {
    return rtf.format(Math.round(diffSec), 'second');
  }
  if (abs < 3600) {
    return rtf.format(Math.round(diffSec / 60), 'minute');
  }
  if (abs < 86_400) {
    return rtf.format(Math.round(diffSec / 3600), 'hour');
  }
  return rtf.format(Math.round(diffSec / 86_400), 'day');
}

/**
 * Builds a canonical pair key like "USD-EUR".
 */
export function toPairKey(from: string, to: string): string {
  return `${from.toUpperCase()}-${to.toUpperCase()}`;
}

/**
 * Parses a "USD-EUR" pair key. Returns null when malformed.
 */
export function parsePairKey(pair: string): { from: string; to: string } | null {
  const [from, to] = pair.split('-');
  if (!from || !to) {
    return null;
  }
  return { from: from.toUpperCase(), to: to.toUpperCase() };
}

/**
 * Type guard for plain objects.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for a record of finite numbers.
 */
export function isNumberRecord(value: unknown): value is Record<string, number> {
  if (!isRecord(value)) {
    return false;
  }
  return Object.values(value).every((item) => typeof item === 'number' && Number.isFinite(item));
}

/**
 * Lowercases and trims a currency code candidate.
 */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}
