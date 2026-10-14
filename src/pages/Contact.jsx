import { useState } from 'react';
import { CheckCircle2, Clock3, Mail, MapPin } from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import { contactApi, errorMessage } from '../services/api';
import { SITE } from '../config/site';
import PageHero from '../components/marketing/PageHero';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import { Input, Textarea } from '../components/ui/Field';

export default function Contact() {
  const { t } = useI18n();
  const { user } = useAuth();
  const empty = { name: user?.fullName || '', email: user?.email || '', subject: '', message: '' };
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await contactApi.send(form);
      setSentTo(form.email);
      setForm(empty);
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setSending(false);
    }
  };

  const info = [
    { Icon: Mail, label: t('contact.emailUs'), value: <a className="font-medium text-brand-700 hover:underline" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> },
    { Icon: Clock3, label: t('contact.hours'), value: t('contact.hoursValue') },
    { Icon: MapPin, label: t('contact.location'), value: t('contact.locationValue') },
  ];

  return (
    <>
      <PageHero eyebrow={t('contact.eyebrow')} title={t('contact.title')} subtitle={t('contact.subtitle')} />
      <section className="container-page grid gap-10 py-20 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6 sm:p-8">
          {sentTo ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-bold">{t('contact.successTitle')}</h2>
              <p className="mt-2 text-ink-600">{t('contact.successText', { email: sentTo })}</p>
              <Button variant="secondary" className="mt-8" onClick={() => setSentTo('')}>{t('contact.sendAnother')}</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5" noValidate={false}>
              {error && <Alert tone="error">{error}</Alert>}
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label={t('contact.name')} value={form.name} onChange={update('name')} required maxLength={120} autoComplete="name" />
                <Input label={t('contact.email')} type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
              </div>
              <Input label={t('contact.subject')} value={form.subject} onChange={update('subject')} required maxLength={200} />
              <Textarea label={t('contact.message')} placeholder={t('contact.messagePlaceholder')} value={form.message} onChange={update('message')} required maxLength={5000} />
              <Button type="submit" loading={sending} className="w-full sm:w-auto">
                {sending ? t('contact.sending') : t('contact.send')}
              </Button>
            </form>
          )}
        </Card>
        <aside className="space-y-4">
          {info.map(({ Icon, label, value }) => (
            <div key={label} className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-ink-500">{label}</p>
                <div className="mt-0.5 text-[15px] text-ink-900">{value}</div>
              </div>
            </div>
          ))}
        </aside>
      </section>
    </>
  );
}
