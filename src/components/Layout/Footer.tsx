import { getTranslations } from 'next-intl/server';
import { StructuredData } from '@/components/SEO/StructuredData';
import { Link } from '@/i18n/navigation';
import { getBaseUrl, getSiteName } from '@/lib/site';

/**
 * Site-wide footer with legal links, disclaimer, and Organization JSON-LD.
 */
export async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  const base = getBaseUrl();
  const name = getSiteName();

  return (
    <footer className="mt-auto border-t bg-slate-50 dark:bg-slate-950">
      <StructuredData
        id="org-schema"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name,
          url: base,
          logo: `${base}/icons/icon-512.png`,
        }}
      />
      <div className="text-muted-foreground mx-auto max-w-6xl space-y-4 px-4 py-10 text-sm">
        <p className="text-foreground font-medium">{t('footer.tagline')}</p>
        <p>{t('legal.disclaimer')}</p>
        <p>{t('legal.attribution')}</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-4">
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            {t('footer.privacy')}
          </Link>
          <Link href="/terms" className="underline-offset-4 hover:underline">
            {t('footer.terms')}
          </Link>
        </nav>
        <p>{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
