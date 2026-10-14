import { ArrowRight, CheckCircle2, Clock3, Languages, Lock, ScanSearch, TriangleAlert, UserRoundCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import { DOCUMENT_TYPES } from '../config/site';
import Button from '../components/ui/Button';
import SectionHeading from '../components/marketing/SectionHeading';
import PricingCards from '../components/marketing/PricingCards';
import FaqList from '../components/marketing/FaqList';
import CtaBand from '../components/marketing/CtaBand';
import DocIcon from '../components/marketing/DocIcon';

function ProductPreview() {
  const { t } = useI18n();
  const rows = [
    { type: 'passport', label: t('landing.preview.passport'), state: 'passed' },
    { type: 'photo', label: t('landing.preview.photo'), state: 'issues' },
    { type: 'insurance', label: t('landing.preview.insurance'), state: 'passed' },
    { type: 'residence_proof', label: t('landing.preview.residence'), state: 'checking' },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-brand-100 via-white to-sky-50 blur-2xl" />
      <div className="relative rounded-2xl border border-ink-100 bg-white p-5 shadow-lift sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">{t('landing.preview.title')}</p>
            <p className="mt-0.5 text-xs text-ink-500">{t('landing.preview.progress')}</p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Smart</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full w-2/3 rounded-full bg-brand-600" />
        </div>
        <ul className="mt-5 space-y-2.5">
          {rows.map((row) => (
            <li key={row.type} className="rounded-xl border border-ink-100 p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-50 text-ink-600">
                  <DocIcon type={row.type} className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1 text-sm font-medium text-ink-800">{row.label}</span>
                {row.state === 'passed' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {row.state === 'issues' && <TriangleAlert className="h-5 w-5 text-amber-500" />}
                {row.state === 'checking' && <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />}
              </div>
              {row.state === 'issues' && (
                <p className="ml-12 mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800">
                  {t('landing.preview.issue')}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Landing() {
  const { t } = useI18n();
  const { user } = useAuth();
  const points = t('landing.hero.points');
  const steps = t('landing.steps.items');
  const features = t('landing.features.items');
  const faqs = t('faq.items');
  const featureIcons = [ScanSearch, Languages, Lock, UserRoundCheck];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_0%,#EFF5FF,transparent)]" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1 text-sm font-medium text-brand-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              {t('landing.hero.eyebrow')}
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
              {t('landing.hero.title')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">{t('landing.hero.subtitle')}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button to={user ? '/dashboard' : '/register'} size="lg">
                {t('landing.hero.primary')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button to="/how-it-works" variant="secondary" size="lg">
                {t('landing.hero.secondary')}
              </Button>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
              {Array.isArray(points) &&
                points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-medium text-ink-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                    {p}
                  </li>
                ))}
            </ul>
          </div>
          <ProductPreview />
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-ink-100 bg-ink-50/60">
        <div className="container-page grid gap-6 py-14 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
            <Clock3 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-2xl font-bold sm:text-[1.7rem]">{t('landing.problem.title')}</h2>
            <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-ink-600">{t('landing.problem.text')}</p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="container-page py-20 sm:py-24">
        <SectionHeading eyebrow={t('landing.steps.eyebrow')} title={t('landing.steps.title')} />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {Array.isArray(steps) &&
            steps.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border border-ink-100 bg-white p-7 shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-display text-base font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-600">{step.text}</p>
              </li>
            ))}
        </ol>
      </section>

      {/* Documents */}
      <section className="bg-ink-50/60 py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow={t('landing.docs.eyebrow')} title={t('landing.docs.title')} subtitle={t('landing.docs.subtitle')} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DOCUMENT_TYPES.map((doc) => (
              <div key={doc.type} className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <DocIcon type={doc.type} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-sans text-base font-semibold text-ink-900">{t(`documents.${doc.type}.name`)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{t(`documents.${doc.type}.hint`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-ink-950 py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading inverted eyebrow={t('landing.features.eyebrow')} title={t('landing.features.title')} />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
            {Array.isArray(features) &&
              features.map((f, i) => {
                const Icon = featureIcons[i] || ScanSearch;
                return (
                  <div key={f.title} className="bg-ink-950 p-8">
                    <Icon className="h-6 w-6 text-brand-300" aria-hidden="true" />
                    <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-300">{f.text}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container-page scroll-mt-20 py-20 sm:py-24">
        <SectionHeading center eyebrow={t('landing.pricing.eyebrow')} title={t('landing.pricing.title')} subtitle={t('landing.pricing.subtitle')} />
        <div className="mt-14">
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-ink-100 bg-ink-50/60 py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <SectionHeading eyebrow={t('landing.faq.eyebrow')} title={t('landing.faq.title')} />
            <Button to="/faq" variant="secondary" className="mt-8">
              {t('landing.faq.all')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <FaqList items={Array.isArray(faqs) ? faqs.slice(0, 5) : []} />
        </div>
      </section>

      <div className="pt-20">
        <CtaBand />
      </div>
    </>
  );
}
