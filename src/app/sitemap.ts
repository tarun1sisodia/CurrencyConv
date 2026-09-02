import type { MetadataRoute } from 'next';
import { TOP_SEO_PAIRS } from '@/lib/currencies';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/site';

/**
 * Sitemap covering every locale × static page × top pair landing page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const staticPaths = ['', '/favorites', '/alerts', '/privacy', '/terms'];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'hourly' : 'weekly',
        priority: path === '' ? 1 : 0.6,
      });
    }
    for (const [from, to] of TOP_SEO_PAIRS) {
      entries.push({
        url: `${base}/${locale}/${from.toLowerCase()}-to-${to.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.8,
      });
    }
  }
  return entries;
}
