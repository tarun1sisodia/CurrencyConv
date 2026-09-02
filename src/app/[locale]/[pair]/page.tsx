import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { PairHydrator } from '@/components/PairHydrator';
import { StructuredData } from '@/components/SEO/StructuredData';
import { getCurrency, getRelatedPairs, isValidCurrencyCode, TOP_SEO_PAIRS } from '@/lib/currencies';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { asLocale } from '@/lib/locale';
import { buildPageMetadata } from '@/lib/seo';
import { getBaseUrl } from '@/lib/site';
import { normalizeCode } from '@/lib/utils';

interface PairPageProps {
  params: Promise<{ locale: string; pair: string }>;
}

const PAIR_RE = /^([a-z]{3})-to-([a-z]{3})$/i;

/**
 * Parses `/usd-to-eur` style slugs. Next.js 16 cannot resolve the
 * `[from]-to-[to]` folder pattern (InvariantError), so we keep the public
 * URL shape via a single `[pair]` segment.
 */
export function parsePairSlug(slug: string): { from: string; to: string } | null {
  const match = PAIR_RE.exec(slug);
  if (!match?.[1] || !match[2]) {
    return null;
  }
  return { from: normalizeCode(match[1]), to: normalizeCode(match[2]) };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    TOP_SEO_PAIRS.map(([from, to]) => ({
      locale,
      pair: `${from.toLowerCase()}-to-${to.toLowerCase()}`,
    })),
  );
}

export const dynamicParams = true;

export async function generateMetadata({ params }: PairPageProps): Promise<Metadata> {
  const { locale, pair } = await params;
  const parsed = parsePairSlug(pair);
  if (!parsed) {
    return {};
  }
  const { from, to } = parsed;
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const fromName = getCurrency(from)?.name ?? from;
  const toName = getCurrency(to)?.name ?? to;
  return buildPageMetadata({
    locale,
    path: `/${from.toLowerCase()}-to-${to.toLowerCase()}`,
    title: messages.meta.pairTitle.replaceAll('{from}', from).replaceAll('{to}', to),
    description: messages.meta.pairDescription
      .replaceAll('{from}', from)
      .replaceAll('{to}', to)
      .replaceAll('{fromName}', fromName)
      .replaceAll('{toName}', toName),
  });
}

export default async function PairPage({ params }: PairPageProps) {
  const { locale, pair } = await params;
  setRequestLocale(asLocale(locale));
  const parsed = parsePairSlug(pair);
  if (
    !parsed ||
    !isValidCurrencyCode(parsed.from) ||
    !isValidCurrencyCode(parsed.to) ||
    parsed.from === parsed.to
  ) {
    notFound();
  }
  const { from, to } = parsed;
  const t = await getTranslations();
  const fromOpt = getCurrency(from);
  const toOpt = getCurrency(to);
  const related = getRelatedPairs(from, to);
  const base = getBaseUrl();
  const path = `/${locale}/${from.toLowerCase()}-to-${to.toLowerCase()}`;

  return (
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-4 py-10">
      <StructuredData
        id="breadcrumb-schema"
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('nav.home'), item: `${base}/${locale}` },
            { '@type': 'ListItem', position: 2, name: `${from} to ${to}`, item: `${base}${path}` },
          ],
        }}
      />
      <PairHydrator from={from} to={to} />
      <header className="space-y-3">
        <p className="text-muted-foreground text-sm">
          <Link href="/" className="underline-offset-4 hover:underline">
            {t('nav.home')}
          </Link>
          {' / '}
          {from} → {to}
        </p>
        <h1 className="text-3xl font-bold">
          {t('pair.h1', { from, to })} {fromOpt?.flag} {toOpt?.flag}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('pair.explain', {
            from,
            to,
            fromName: fromOpt?.name ?? from,
            toName: toOpt?.name ?? to,
          })}
        </p>
      </header>
      <CurrencyConverter />
      <section aria-labelledby="related-heading">
        <h2 id="related-heading" className="mb-3 text-xl font-semibold">
          {t('pair.related')}
        </h2>
        <ul className="flex flex-wrap gap-3">
          {related.map(([relFrom, relTo]) => (
            <li key={`${relFrom}-${relTo}`}>
              <Link
                href={`/${relFrom.toLowerCase()}-to-${relTo.toLowerCase()}`}
                className="rounded-full border px-3 py-1 text-sm hover:border-indigo-400"
              >
                {relFrom} → {relTo}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
