import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { asLocale } from '@/lib/locale';
import { buildPageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: asLocale(locale), namespace: 'legal' });
  return buildPageMetadata({
    locale,
    path: '/terms',
    title: `${t('termsTitle')} | CurrencyConv`,
    description: t('termsTitle'),
  });
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(asLocale(locale));
  const t = await getTranslations('terms');
  const heading = await getTranslations('legal');

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-10">
      <h1 className="text-3xl font-bold">{heading('termsTitle')}</h1>
      <p>{t('intro')}</p>
      <h2 className="text-xl font-semibold">{t('useTitle')}</h2>
      <p className="text-muted-foreground">{t('useBody')}</p>
      <h2 className="text-xl font-semibold">{t('dataTitle')}</h2>
      <p className="text-muted-foreground">{t('dataBody')}</p>
      <h2 className="text-xl font-semibold">{t('liabilityTitle')}</h2>
      <p className="text-muted-foreground">{t('liabilityBody')}</p>
      <h2 className="text-xl font-semibold">{t('lawTitle')}</h2>
      <p className="text-muted-foreground">{t('lawBody')}</p>
    </main>
  );
}
