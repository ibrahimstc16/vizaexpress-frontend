import { useI18n } from '../i18n';
import Button from '../components/ui/Button';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-3xl font-bold">{t('notFound.title')}</h1>
      <p className="mt-3 max-w-md text-ink-600">{t('notFound.text')}</p>
      <Button to="/" className="mt-8">{t('notFound.home')}</Button>
    </section>
  );
}
