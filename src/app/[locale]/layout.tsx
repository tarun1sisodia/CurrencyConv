import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { CookieConsentBanner } from '@/components/Layout/CookieConsentBanner';
import { InstallPrompt } from '@/components/Layout/InstallPrompt';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Providers } from '@/components/Providers';
import { PWARegister } from '@/components/PWARegister';
import { routing } from '@/i18n/routing';
import { asLocale } from '@/lib/locale';
import { buildPageMetadata } from '@/lib/seo';
import { inter } from '@/lib/fonts';
import { getSiteName } from '@/lib/site';
import '@/app/globals.css';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;
  return {
    ...buildPageMetadata({
      locale,
      path: '/',
      title: messages.meta.title,
      description: messages.meta.description,
    }),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    applicationName: getSiteName(),
    icons: {
      icon: '/icons/icon-192.png',
      apple: '/icons/apple-touch-icon.png',
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(asLocale(locale));
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${inter.className} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.frankfurter.app" />
        <link rel="preconnect" href="https://open.er-api.com" />
        <link rel="preconnect" href="https://v6.exchangerate-api.com" />
      </head>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <PWARegister />
            <Header />
            <OfflineBanner />
            {children}
            <Footer />
            <CookieConsentBanner />
            <InstallPrompt />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
