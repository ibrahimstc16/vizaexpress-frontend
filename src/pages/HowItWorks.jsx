import { ArrowRight, Info } from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import PageHero from '../components/marketing/PageHero';
import CtaBand from '../components/marketing/CtaBand';
import Button from '../components/ui/Button';

export default function HowItWorks() {
  const { t } = useI18n();
  const { user } = useAuth();
  const steps = t('how.steps');

  return (
    <>
      <PageHero eyebrow={t('how.eyebrow')} title={t('how.title')} subtitle={t('how.subtitle')}>
        <Button to={user ? '/dashboard' : '/register'} size="lg" className="mt-8">
          {t('how.cta')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </PageHero>

      <section className="container-page py-20">
        <ol className="relative mx-auto max-w-3xl">
          {Array.isArray(steps) &&
            steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-6 pb-12 last:pb-0">
                {i < steps.length - 1 && <span className="absolute left-5 top-11 h-[calc(100%-2.75rem)] w-px bg-ink-200" aria-hidden="true" />}
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 font-display font-bold text-brand-700">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h2 className="text-xl font-bold">{step.title}</h2>
                  <p className="mt-2 text-[17px] leading-relaxed text-ink-600">{step.text}</p>
                </div>
              </li>
            ))}
        </ol>
        <div className="mx-auto mt-14 flex max-w-3xl gap-3 rounded-2xl border border-ink-100 bg-ink-50 p-5 text-sm leading-relaxed text-ink-600">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
          {t('how.note')}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
