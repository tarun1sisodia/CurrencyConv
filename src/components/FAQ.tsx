import { getTranslations } from 'next-intl/server';
import { StructuredData } from '@/components/SEO/StructuredData';

/**
 * Five FAQ items plus FAQPage JSON-LD.
 */
export async function FAQ() {
  const t = await getTranslations('faq');
  const items = [1, 2, 3, 4, 5].map((index) => ({
    q: t(`q${index}` as 'q1'),
    a: t(`a${index}` as 'a1'),
  }));

  return (
    <section className="space-y-4" aria-labelledby="faq-heading">
      <StructuredData
        id="faq-schema"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        }}
      />
      <h2 id="faq-heading" className="text-xl font-semibold">
        {t('title')}
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.q} className="bg-card rounded-xl border p-4">
            <summary className="focus-visible:ring-ring cursor-pointer font-medium focus-visible:ring-2">
              {item.q}
            </summary>
            <p className="text-muted-foreground mt-2 text-sm">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
