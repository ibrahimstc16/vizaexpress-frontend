import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAuth } from '../../lib/auth';
import Button from '../ui/Button';

export default function CtaBand() {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <section className="container-page pb-20 pt-4 sm:pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(59,106,246,0.35),transparent)]" aria-hidden="true" />
        <div className="relative">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('landing.cta.title')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-300">{t('landing.cta.text')}</p>
          <Button to={user ? '/dashboard' : '/register'} variant="light" size="lg" className="mt-8">
            {t('landing.cta.button')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
