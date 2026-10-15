import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, CircleAlert, Clock3 } from 'lucide-react';
import { useI18n } from '../i18n';
import { knownErrorMessage, paymentsApi } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

export default function PaymentSuccess() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const applicationId = params.get('application_id');
  const [state, setState] = useState(sessionId ? 'verifying' : 'error');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return undefined;
    let active = true;
    paymentsApi
      .verify(sessionId)
      .then(({ data }) => active && setState(data.paid ? 'success' : 'pending'))
      .catch((err) => {
        if (!active) return;
        setError(err);
        setState('error');
      });
    return () => {
      active = false;
    };
  }, [sessionId]);

  const views = {
    success: { Icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', title: t('paymentSuccess.successTitle'), text: t('paymentSuccess.successText') },
    pending: { Icon: Clock3, color: 'bg-amber-50 text-amber-600', title: t('paymentSuccess.pendingTitle'), text: t('paymentSuccess.pendingText') },
    error: { Icon: CircleAlert, color: 'bg-red-50 text-red-600', title: t('paymentSuccess.errorTitle'), text: knownErrorMessage(error, t) || t('paymentSuccess.errorText') },
  };
  const view = views[state];

  return (
    <Card className="mx-auto mt-6 max-w-lg animate-fade-up p-8 text-center sm:p-10">
      {state === 'verifying' ? (
        <div className="py-8" role="status">
          <Spinner className="mx-auto h-8 w-8" />
          <p className="mt-4 text-ink-600">{t('paymentSuccess.verifying')}</p>
        </div>
      ) : (
        <>
          <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${view.color}`}>
            <view.Icon className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">{view.title}</h1>
          <p className="mt-2 leading-relaxed text-ink-600">{view.text}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {applicationId && <Button to={`/application/${applicationId}`}>{t('paymentSuccess.toApplication')}</Button>}
            <Button to="/dashboard" variant="secondary">{t('paymentSuccess.toDashboard')}</Button>
            {state === 'error' && <Button to="/contact" variant="ghost">{t('nav.contact')}</Button>}
          </div>
        </>
      )}
    </Card>
  );
}
