import { MessageCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import PageHero from '../components/marketing/PageHero';
import FaqList from '../components/marketing/FaqList';
import Button from '../components/ui/Button';

export default function FAQ() {
  const { t } = useI18n();
  const items = t('faq.items');

  return (
    <>
      <PageHero eyebrow={t('faq.eyebrow')} title={t('faq.title')} subtitle={t('faq.subtitle')} />
      <section className="container-page grid gap-10 py-20 lg:grid-cols-[1.7fr_1fr]">
        <FaqList items={Array.isArray(items) ? items : []} />
        <aside className="h-fit rounded-2xl border border-ink-100 bg-ink-50 p-7">
          <MessageCircle className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">{t('faq.contactTitle')}</h2>
          <p className="mt-2 leading-relaxed text-ink-600">{t('faq.contactText')}</p>
          <Button to="/contact" className="mt-6">{t('faq.contactButton')}</Button>
        </aside>
      </section>
    </>
  );
}
