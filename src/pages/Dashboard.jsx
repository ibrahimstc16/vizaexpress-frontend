import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, FolderOpen, Plus } from 'lucide-react';
import { useI18n } from '../i18n';
import { useAuth } from '../lib/auth';
import { applicationsApi, errorMessage } from '../services/api';
import { DOCUMENT_TYPES, PLANS, PLAN_PRICES } from '../config/site';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { cx } from '../components/ui/cx';

const REQUIRED_COUNT = DOCUMENT_TYPES.filter((d) => d.required).length;

function PlanPicker({ open, initialPlan, onClose, onCreated }) {
  const { t, formatNumber } = useI18n();
  const [plan, setPlan] = useState(initialPlan || 'smart');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    setCreating(true);
    setError('');
    try {
      const { data } = await applicationsApi.create(plan);
      onCreated(data.application);
    } catch (err) {
      setError(errorMessage(err, t));
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('dashboard.choosePlanTitle')} description={t('dashboard.choosePlanText')} closeLabel={t('common.close')}>
      <div className="space-y-3" role="radiogroup" aria-label={t('dashboard.choosePlanTitle')}>
        {PLANS.map((p) => {
          const selected = plan === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPlan(p.id)}
              className={cx(
                'flex w-full items-start gap-4 rounded-xl border p-4 text-left transition',
                selected ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600' : 'border-ink-200 hover:border-ink-300'
              )}
            >
              <span className={cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-brand-600' : 'border-ink-300')}>
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
              </span>
              <span className="flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink-900">
                    {t(`plans.${p.id}.name`)}
                    {p.popular && <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white">{t('common.mostPopular')}</span>}
                  </span>
                  <span className="whitespace-nowrap font-semibold text-ink-900">{formatNumber(p.price)} {t('common.pln')}</span>
                </span>
                <span className="mt-1 block text-sm text-ink-600">{t(`plans.${p.id}.description`)}</span>
              </span>
            </button>
          );
        })}
      </div>
      {error && <Alert tone="error" className="mt-4">{error}</Alert>}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={create} loading={creating}>{creating ? t('dashboard.creating') : t('dashboard.create')}</Button>
      </div>
    </Modal>
  );
}

function ApplicationRow({ app }) {
  const { t, formatDate } = useI18n();
  const status = app.status || 'created';
  const done = Math.min(Number(app.passed_required_count) || 0, REQUIRED_COUNT);
  const pct = Math.round((done / REQUIRED_COUNT) * 100);

  return (
    <Link
      to={`/application/${app.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition hover:border-ink-200 hover:shadow-lift sm:flex-row sm:items-center sm:p-6"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-sans text-base font-semibold text-ink-900">
            {t('application.title', { plan: t(`plans.${app.package_type}.name`) })}
          </h3>
          <StatusBadge status={status} label={t(`status.${status}`)} />
        </div>
        <p className="mt-1 text-sm text-ink-500">{t('dashboard.created', { date: formatDate(app.created_at) })}</p>
      </div>
      <div className="w-full sm:w-56">
        <div className="flex justify-between text-xs font-medium text-ink-500">
          <span>{t('dashboard.documentsProgress', { done, total: REQUIRED_COUNT })}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div className={cx('h-full rounded-full', pct === 100 ? 'bg-emerald-500' : 'bg-brand-600')} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ChevronRight className="hidden h-5 w-5 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-500 sm:block" aria-hidden="true" />
    </Link>
  );
}

export default function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const planParam = PLAN_PRICES[params.get('plan')] ? params.get('plan') : null;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(!!planParam);

  const load = useCallback(async () => {
    setError('');
    try {
      const { data } = await applicationsApi.list();
      setApplications(data.applications || []);
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const closePicker = () => {
    setPickerOpen(false);
    if (planParam) setParams({}, { replace: true });
  };

  const firstName = (user?.fullName || '').split(' ')[0];

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.greeting', { name: firstName })}</h1>
          <p className="mt-1.5 text-ink-600">{t('dashboard.subtitle')}</p>
        </div>
        {applications.length > 0 && (
          <Button onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('dashboard.newApplication')}
          </Button>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <PageSpinner />
        ) : error ? (
          <Alert tone="error" action={<Button size="sm" variant="secondary" onClick={load}>{t('common.retry')}</Button>}>
            {t('dashboard.loadError')} {error}
          </Alert>
        ) : applications.length === 0 ? (
          <Card className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <FolderOpen className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-bold">{t('dashboard.emptyTitle')}</h2>
            <p className="mt-2 max-w-sm text-ink-600">{t('dashboard.emptyText')}</p>
            <Button className="mt-7" onClick={() => setPickerOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('dashboard.createFirst')}
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicationRow key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {pickerOpen && (
        <PlanPicker
          open
          initialPlan={planParam}
          onClose={closePicker}
          onCreated={(app) => navigate(`/application/${app.id}`)}
        />
      )}
    </div>
  );
}
