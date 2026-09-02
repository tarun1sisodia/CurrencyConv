import Script from 'next/script';

interface StructuredDataProps {
  id: string;
  data: object;
}

/**
 * Renders JSON-LD via next/script for search engines.
 */
export function StructuredData({ id, data }: StructuredDataProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
