import { HeartHandshake, Lock, MessageSquareText } from 'lucide-react';
import { useI18n } from '../i18n';
import PageHero from '../components/marketing/PageHero';
import Button from '../components/ui/Button';

export default function About() {
  const { t } = useI18n();
  const values = t('about.values');
  const icons = [MessageSquareText, HeartHandshake, Lock];

  return (
    <>
      <PageHero eyebrow={t('about.eyebrow')} title={t('about.title')} subtitle={t('about.intro')} />
      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{t('about.missionTitle')}</h2>
        </div>
        <p className="text-lg leading-relaxed text-ink-700">{t('about.mission')}</p>
      </section>
      <section className="border-t border-ink-100 bg-ink-50/60 py-20">
        <div className="container-page">
          <h2 className="text-2xl font-bold sm:text-3xl">{t('about.valuesTitle')}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {Array.isArray(values) &&
              values.map((v, i) => {
                const Icon = icons[i] || Lock;
                return (
                  <div key={v.title} className="rounded-2xl border border-ink-100 bg-white p-7 shadow-card">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold">{v.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-600">{v.text}</p>
                  </div>
                );
              })}
          </div>
          <Button to="/contact" variant="secondary" className="mt-12">{t('about.cta')}</Button>
        </div>
      </section>
    </>
  );
}
