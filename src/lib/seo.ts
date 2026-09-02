import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { getBaseUrl, getSiteName } from '@/lib/site';

interface PageMetaInput {
  locale: string;
  path: string;
  title: string;
  description: string;
}

/**
 * Builds canonical, hreflang, Open Graph and Twitter metadata for a page.
 */
export function buildPageMetadata({ locale, path, title, description }: PageMetaInput): Metadata {
  const base = getBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const canonical = `${base}/${locale}${normalized === '/' ? '' : normalized}`;
  const languages: Record<string, string> = {
    'x-default': `${base}/${routing.defaultLocale}${normalized === '/' ? '' : normalized}`,
  };
  for (const loc of routing.locales) {
    languages[loc] = `${base}/${loc}${normalized === '/' ? '' : normalized}`;
  }
  const siteName = getSiteName();
  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName,
      images: [{ url: `${base}/og-image.png`, width: 1200, height: 630, alt: siteName }],
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${base}/og-image.png`],
    },
  };
}
