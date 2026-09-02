import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations('notFound');
  return (
    <main
      id="main"
      className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center"
    >
      <h1 className="text-3xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground mt-3">{t('body')}</p>
      <Link href="/" className="mt-6 text-indigo-600 underline underline-offset-4">
        {t('home')}
      </Link>
    </main>
  );
}
