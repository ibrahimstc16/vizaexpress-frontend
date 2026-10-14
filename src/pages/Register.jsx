import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import { authApi, errorMessage } from '../services/api';
import { PLAN_PRICES } from '../config/site';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import { Input, PasswordInput } from '../components/ui/Field';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { t } = useI18n();
  const { user, signIn } = useAuth();
  const [params] = useSearchParams();
  const plan = PLAN_PRICES[params.get('plan')] ? params.get('plan') : null;
  const target = plan ? `/dashboard?plan=${plan}` : '/dashboard';

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={target} replace />;

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (fieldErrors[key]) setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = t('auth.errors.fullName');
    if (!EMAIL_RE.test(form.email.trim())) errs.email = t('auth.errors.email');
    if (form.password.length < 8) errs.password = t('auth.errors.password');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      signIn(data.token, data.user);
    } catch (err) {
      const res = err.response;
      if (res?.status === 409) {
        setError(t('auth.register.emailTaken'));
      } else if (res?.status === 400 && res.data?.field && t(`auth.errors.${res.data.field}`) !== `auth.errors.${res.data.field}`) {
        setFieldErrors({ [res.data.field]: t(`auth.errors.${res.data.field}`) });
      } else {
        setError(errorMessage(err, t));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footer={
        <>
          {t('auth.register.hasAccount')}{' '}
          <Link to={`/login${plan ? `?next=${encodeURIComponent(target)}` : ''}`} className="font-semibold text-brand-700 hover:underline">
            {t('auth.register.login')}
          </Link>
        </>
      }
    >
      {plan && (
        <Badge tone="brand" className="mb-6">
          {t('auth.register.selectedPlan', { plan: t(`plans.${plan}.name`) })}
        </Badge>
      )}
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && (
          <Alert tone="error">
            {error}
            {error === t('auth.register.emailTaken') && (
              <>
                {' '}
                <Link to="/login" className="font-semibold underline">{t('auth.register.login')}</Link>
              </>
            )}
          </Alert>
        )}
        <Input
          label={t('auth.fullName')}
          placeholder={t('auth.fullNamePlaceholder')}
          autoComplete="name"
          value={form.fullName}
          onChange={update('fullName')}
          error={fieldErrors.fullName}
          autoFocus
        />
        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          value={form.email}
          onChange={update('email')}
          error={fieldErrors.email}
        />
        <Input
          label={t('auth.phone')}
          optionalLabel={t('auth.optional')}
          type="tel"
          autoComplete="tel"
          placeholder="+48 000 000 000"
          value={form.phone}
          onChange={update('phone')}
        />
        <PasswordInput
          label={t('auth.password')}
          autoComplete="new-password"
          hint={t('auth.passwordHint')}
          value={form.password}
          onChange={update('password')}
          error={fieldErrors.password}
          showLabel={t('auth.showPassword')}
          hideLabel={t('auth.hidePassword')}
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
        <p className="text-center text-xs leading-relaxed text-ink-500">{t('auth.register.terms')}</p>
      </form>
    </AuthLayout>
  );
}
