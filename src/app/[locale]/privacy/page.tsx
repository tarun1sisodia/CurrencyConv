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
    path: '/privacy',
    title: `${t('privacyTitle')} | CurrencyConv`,
    description: t('privacyTitle'),
  });
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(asLocale(locale));
  const t = await getTranslations('privacy');
  const heading = await getTranslations('legal');

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-10">
      <h1 className="text-3xl font-bold">{heading('privacyTitle')}</h1>
      <p>{t('intro')}</p>
      <h2 className="text-xl font-semibold">{t('localTitle')}</h2>
      <p className="text-muted-foreground">{t('localBody')}</p>
      <h2 className="text-xl font-semibold">{t('serverTitle')}</h2>
      <p className="text-muted-foreground">{t('serverBody')}</p>
      <h2 className="text-xl font-semibold">{t('cookiesTitle')}</h2>
      <p className="text-muted-foreground">{t('cookiesBody')}</p>
      <h2 className="text-xl font-semibold">{t('alertsTitle')}</h2>
      <p className="text-muted-foreground">{t('alertsBody')}</p>
      <h2 className="text-xl font-semibold">{t('contactTitle')}</h2>
      <p className="text-muted-foreground">{t('contactBody')}</p>
    </main>
  );
}
