import { useI18n } from '../i18n';
import PageHero from '../components/marketing/PageHero';
import PricingCards from '../components/marketing/PricingCards';
import FaqList from '../components/marketing/FaqList';

export default function Pricing() {
  const { t } = useI18n();
  const faqs = t('faq.items');
  // The plan, refund and guarantee questions are the ones people ask before paying.
  const pricingFaqs = Array.isArray(faqs) ? faqs.slice(4, 7) : [];

  return (
    <>
      <PageHero eyebrow={t('landing.pricing.eyebrow')} title={t('landing.pricing.title')} subtitle={t('landing.pricing.subtitle')} />
      <section className="container-page py-20">
        <PricingCards />
        <div className="mx-auto mt-20 max-w-3xl">
          <FaqList items={pricingFaqs} />
        </div>
      </section>
    </>
  );
}
