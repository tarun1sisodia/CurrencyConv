import { getTranslations } from 'next-intl/server';
import { ArrowRightLeft, Keyboard, LineChart } from 'lucide-react';

/**
 * Three-step explainer for SEO and first-time users.
 */
export async function HowItWorks() {
  const t = await getTranslations('how');
  const steps = [
    { title: t('step1Title'), body: t('step1Body'), icon: ArrowRightLeft },
    { title: t('step2Title'), body: t('step2Body'), icon: Keyboard },
    { title: t('step3Title'), body: t('step3Body'), icon: LineChart },
  ];

  return (
    <section className="space-y-6" aria-labelledby="how-heading">
      <h2 id="how-heading" className="text-xl font-semibold">
        {t('title')}
      </h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="bg-card rounded-2xl border p-5 shadow-sm">
            <step.icon className="mb-3 h-8 w-8 text-indigo-600 dark:text-indigo-400" aria-hidden />
            <p className="text-sm font-semibold text-indigo-600">
              {index + 1}. {step.title}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
