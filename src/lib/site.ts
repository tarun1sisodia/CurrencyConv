import { SITE_NAME } from '@/lib/constants';

/**
 * Resolves the canonical origin for SEO, sitemap, and embed snippets.
 */
export function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return `https://${vercel.replace(/\/$/, '')}`;
  }
  return 'http://localhost:3000';
}

/**
 * Returns the public brand name.
 */
export function getSiteName(): string {
  return SITE_NAME;
}
