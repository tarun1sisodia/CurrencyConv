import { routing, type AppLocale } from '@/i18n/routing';

/**
 * Narrows an untyped route param to a supported locale.
 */
export function asLocale(value: string): AppLocale {
  return routing.locales.includes(value as AppLocale)
    ? (value as AppLocale)
    : routing.defaultLocale;
}
