import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import { authApi, errorMessage } from '../services/api';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { Input, PasswordInput } from '../components/ui/Field';

// Only allow redirects to paths inside this site.
function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
}

export default function Login() {
  const { t } = useI18n();
  const { user, signIn } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Signing in re-renders this page with a user, which redirects from here.
  if (user) return <Navigate to={user.isAdmin && next === '/dashboard' ? '/admin' : next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login({ email: form.email.trim(), password: form.password });
      signIn(data.token, data.user);
    } catch (err) {
      setError(err.response?.status === 401 ? t('auth.login.invalid') : errorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.noAccount')}{' '}
          <Link to={`/register${params.get('plan') ? `?plan=${params.get('plan')}` : ''}`} className="font-semibold text-brand-700 hover:underline">
            {t('auth.login.createAccount')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        {params.get('expired') && !error && <Alert tone="info">{t('auth.login.expired')}</Alert>}
        {error && <Alert tone="error">{error}</Alert>}
        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          autoFocus
        />
        <PasswordInput
          label={t('auth.password')}
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          showLabel={t('auth.showPassword')}
          hideLabel={t('auth.hidePassword')}
          required
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
