import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { FAQ } from '@/components/FAQ';
import { HomeBelowFold } from '@/components/HomeBelowFold';
import { HowItWorks } from '@/components/HowItWorks';
import { PopularPairs } from '@/components/PopularPairs';
import { StructuredData } from '@/components/SEO/StructuredData';
import { asLocale } from '@/lib/locale';
import { getBaseUrl, getSiteName } from '@/lib/site';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(asLocale(locale));
  const t = await getTranslations();
  const base = getBaseUrl();
  const name = getSiteName();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-16 px-4 py-10">
      <StructuredData
        id="webapp-schema"
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name,
          url: `${base}/${locale}`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <section className="-mx-4 bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-12 text-white sm:rounded-3xl sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('hero.title')}</h1>
          <p className="mt-3 text-base text-blue-100 sm:text-lg">{t('hero.subtitle')}</p>
        </div>
        <div className="mt-8">
          <CurrencyConverter />
        </div>
      </section>
      <HowItWorks />
      <PopularPairs />
      <HomeBelowFold />
      <FAQ />
    </main>
  );
}
