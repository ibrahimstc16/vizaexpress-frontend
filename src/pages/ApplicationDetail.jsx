import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, CircleAlert, CloudUpload, CreditCard, ExternalLink, Lightbulb, Lock, RefreshCw, TriangleAlert } from 'lucide-react';
import { useI18n } from '../i18n';
import { applicationsApi, documentsApi, errorMessage, paymentsApi } from '../services/api';
import { DOCUMENT_TYPES, PLAN_PRICES } from '../config/site';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Badge, { StatusBadge } from '../components/ui/Badge';
import Spinner, { PageSpinner } from '../components/ui/Spinner';
import DocIcon from '../components/marketing/DocIcon';
import { cx } from '../components/ui/cx';

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const POLL_MS = 3000;
const MAX_POLLS = 60;
const PAID_STATUSES = ['paid', 'pending', 'reviewing', 'approved', 'rejected'];

function parseResult(doc) {
  const raw = doc?.ai_validation_result;
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function docState(doc) {
  if (!doc) return 'empty';
  const s = doc.ai_validation_status;
  if (s === 'passed' || s === 'issues' || s === 'error') return s;
  return 'pending';
}

function asText(item) {
  if (typeof item === 'string') return item;
  return item?.message || item?.text || JSON.stringify(item);
}

function DocumentCard({ spec, doc, uploading, progress, error, onUpload, onView }) {
  const { t } = useI18n();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const state = uploading ? 'uploading' : docState(doc);
  const result = parseResult(doc);

  const pick = () => inputRef.current?.click();
  const onFiles = (files) => files?.[0] && onUpload(spec.type, files[0]);

  const border = {
    passed: 'border-emerald-200',
    issues: 'border-amber-200',
    error: 'border-red-200',
  }[state] || 'border-ink-100';

  return (
    <Card className={cx('overflow-hidden', border)}>
      <div className="flex items-start gap-4 p-5">
        <span className={cx(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          state === 'passed' ? 'bg-emerald-50 text-emerald-600' : state === 'issues' ? 'bg-amber-50 text-amber-600' : state === 'error' ? 'bg-red-50 text-red-600' : 'bg-ink-50 text-ink-500'
        )}>
          <DocIcon type={spec.type} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-sans text-base font-semibold text-ink-900">{t(`documents.${spec.type}.name`)}</h3>
            <Badge tone={spec.required ? 'neutral' : 'neutral'} className={spec.required ? '' : 'opacity-70'}>
              {spec.required ? t('application.required') : t('application.optional')}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">{t(`documents.${spec.type}.hint`)}</p>
        </div>
        <div className="hidden shrink-0 sm:block">
          {state === 'passed' && <Badge tone="success"><Check className="h-3.5 w-3.5" />{t('validation.passed')}</Badge>}
          {state === 'issues' && <Badge tone="warning">{t('validation.issues')}</Badge>}
          {state === 'error' && <Badge tone="danger">{t('validation.error')}</Badge>}
          {state === 'pending' && <Badge tone="info">{t('validation.pending')}</Badge>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = '';
        }}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="px-5 pb-5">
        {state === 'empty' && (
          <button
            type="button"
            onClick={pick}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFiles(e.dataTransfer.files);
            }}
            className={cx(
              'flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition',
              dragging ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-brand-400 hover:bg-brand-50/40'
            )}
          >
            <CloudUpload className="h-6 w-6 text-brand-600" aria-hidden="true" />
            <span className="mt-2 text-sm font-semibold text-ink-800">{t('application.dropHere')}</span>
            <span className="mt-1 text-xs text-ink-500">{t('application.formats')}</span>
          </button>
        )}

        {state === 'uploading' && (
          <div className="rounded-xl bg-ink-50 p-4">
            <div className="flex items-center gap-3 text-sm font-medium text-ink-700">
              <Spinner className="h-4 w-4" />
              {t('application.uploading')} {progress ? `${progress}%` : ''}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-200">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress || 5}%` }} />
            </div>
          </div>
        )}

        {state === 'pending' && (
          <div className="flex items-center gap-3 rounded-xl bg-sky-50 p-4 text-sm text-sky-800">
            <Spinner className="h-4 w-4 text-sky-600" />
            {t('application.checking')}
          </div>
        )}

        {(state === 'passed' || state === 'issues' || state === 'error') && (
          <div className={cx(
            'rounded-xl p-4 text-sm',
            state === 'passed' ? 'bg-emerald-50/70 text-emerald-900' : state === 'issues' ? 'bg-amber-50/80 text-amber-900' : 'bg-red-50/80 text-red-900'
          )}>
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-start gap-2 font-medium">
                {state === 'passed' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : state === 'issues' ? <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
                <span>{result?.summary || t(`validation.${state}`)}</span>
              </p>
              {state !== 'error' && result?.score > 0 && (
                <span className="shrink-0 text-xs font-semibold opacity-80">{t('application.score', { score: result.score })}</span>
              )}
            </div>
            {Array.isArray(result?.issues) && result.issues.length > 0 && (
              <div className="mt-3">
                {state !== 'error' && <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{t('application.issues')}</p>}
                <ul className="mt-1.5 list-disc space-y-1 pl-5">
                  {result.issues.map((issue, i) => <li key={i}>{asText(issue)}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(result?.recommendations) && result.recommendations.length > 0 && (
              <div className="mt-3 border-t border-current/10 pt-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-70">
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('application.recommendations')}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {result.recommendations.map((rec, i) => <li key={i}>{asText(rec)}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {doc && !uploading && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs text-ink-500" title={doc.original_filename}>{doc.original_filename}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => onView(doc)}>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                {t('application.view')}
              </Button>
              <Button size="sm" variant="secondary" onClick={pick}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                {t('application.replace')}
              </Button>
            </div>
          </div>
        )}

        {error && <Alert tone="error" className="mt-3">{error}</Alert>}
      </div>
    </Card>
  );
}

function Stepper({ paid, docsDone, reviewed }) {
  const { t } = useI18n();
  const steps = [
    { label: t('application.steps.payment'), done: paid },
    { label: t('application.steps.documents'), done: docsDone },
    { label: t('application.steps.review'), done: reviewed },
  ];
  const current = steps.findIndex((s) => !s.done);

  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {steps.map((s, i) => (
        <li key={s.label} className="flex flex-1 items-center gap-2 sm:gap-3">
          <span className={cx(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            s.done ? 'bg-emerald-500 text-white' : i === current ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500'
          )}>
            {s.done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
          </span>
          <span className={cx('text-sm font-medium', s.done || i === current ? 'text-ink-900' : 'text-ink-500')}>{s.label}</span>
          {i < steps.length - 1 && <span className={cx('hidden h-px flex-1 sm:block', s.done ? 'bg-emerald-300' : 'bg-ink-200')} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const { t, lang, formatDate, formatNumber } = useI18n();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploads, setUploads] = useState({});
  const [docErrors, setDocErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const polls = useRef(0);

  const load = useCallback(async () => {
    try {
      const { data } = await applicationsApi.get(id);
      setApplication(data.application);
      setDocuments(data.documents || []);
      setLoadError('');
    } catch (err) {
      setLoadError(err.response?.status === 404 || err.response?.status === 400 ? t('application.notFound') : errorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const hasPending = documents.some((d) => docState(d) === 'pending');
  useEffect(() => {
    if (!hasPending) {
      polls.current = 0;
      return undefined;
    }
    if (polls.current >= MAX_POLLS) return undefined;
    const timer = setTimeout(() => {
      polls.current += 1;
      load();
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [hasPending, documents, load]);

  const upload = async (type, file) => {
    setDocErrors((e) => ({ ...e, [type]: '' }));
    if (!ACCEPTED.includes(file.type)) {
      setDocErrors((e) => ({ ...e, [type]: t('application.wrongType') }));
      return;
    }
    if (file.size > MAX_SIZE) {
      setDocErrors((e) => ({ ...e, [type]: t('application.fileTooLarge') }));
      return;
    }
    setUploads((u) => ({ ...u, [type]: 1 }));
    try {
      const { data } = await documentsApi.upload(id, type, file, {
        language: lang,
        onProgress: (pct) => setUploads((u) => ({ ...u, [type]: pct })),
      });
      setDocuments((docs) => [...docs.filter((d) => d.document_type !== type), data.document]);
      polls.current = 0;
    } catch (err) {
      setDocErrors((e) => ({ ...e, [type]: err.response ? errorMessage(err, t) : t('application.uploadError') }));
    } finally {
      setUploads((u) => {
        const next = { ...u };
        delete next[type];
        return next;
      });
    }
  };

  const view = async (doc) => {
    // Open the tab synchronously so pop-up blockers allow it, then load the file into it.
    const win = window.open('', '_blank');
    try {
      const res = await documentsApi.file(doc.id);
      const url = URL.createObjectURL(res.data);
      if (win) win.location.href = url;
      else window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      win?.close();
      setDocErrors((e) => ({ ...e, [doc.document_type]: err.response?.status === 410 ? t('application.fileMissing') : errorMessage(err, t) }));
    }
  };

  const pay = async () => {
    setPaying(true);
    setPayError('');
    try {
      const { data } = await paymentsApi.checkout(application.package_type, application.id);
      window.location.href = data.url;
    } catch (err) {
      setPayError(err.response?.data?.error || t('application.payError'));
      setPaying(false);
    }
  };

  if (loading) return <PageSpinner />;

  if (!application) {
    return (
      <Card className="mx-auto max-w-lg p-10 text-center">
        <CircleAlert className="mx-auto h-10 w-10 text-ink-400" aria-hidden="true" />
        <p className="mt-4 text-lg font-semibold">{loadError || t('application.notFound')}</p>
        <Button to="/dashboard" variant="secondary" className="mt-6">{t('application.back')}</Button>
      </Card>
    );
  }

  const status = application.status || 'created';
  const plan = application.package_type;
  const planName = t(`plans.${plan}.name`);
  const price = formatNumber(PLAN_PRICES[plan] || 0);
  const paid = PAID_STATUSES.includes(status);
  const byType = Object.fromEntries(documents.map((d) => [d.document_type, d]));
  const required = DOCUMENT_TYPES.filter((d) => d.required);
  const requiredDone = required.filter((d) => docState(byType[d.type]) === 'passed').length;
  const reviewed = status === 'approved';

  return (
    <div className="animate-fade-up">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('application.back')}
      </Link>

      <Card className="mt-4 p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold sm:text-3xl">{t('application.title', { plan: planName })}</h1>
              <StatusBadge status={status} label={t(`status.${status}`)} />
            </div>
            <p className="mt-1.5 text-sm text-ink-500">
              {t('application.number', { id: String(application.id).slice(0, 8).toUpperCase() })} · {t('application.createdOn', { date: formatDate(application.created_at) })}
            </p>
          </div>
        </div>
        <div className="mt-6 border-t border-ink-100 pt-5">
          <Stepper paid={paid} docsDone={requiredDone === required.length} reviewed={reviewed} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <h2 className="text-xl font-bold">{t('application.documentsTitle')}</h2>
          <p className="mt-1 text-sm text-ink-600">{t('application.documentsText')}</p>
          <div className="mt-5 grid gap-4">
            {DOCUMENT_TYPES.map((spec) => (
              <DocumentCard
                key={spec.type}
                spec={spec}
                doc={byType[spec.type]}
                uploading={uploads[spec.type] !== undefined}
                progress={uploads[spec.type]}
                error={docErrors[spec.type]}
                onUpload={upload}
                onView={view}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          {paid ? (
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-ink-900">{t('application.paidTitle')}</p>
                  <p className="text-sm text-ink-500">{t('application.paidText', { plan: planName })}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-brand-200 p-5 ring-1 ring-brand-100">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-sans text-lg font-semibold">{t('application.payTitle')}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">{t('application.payText', { price, plan: planName })}</p>
              {payError && <Alert tone="error" className="mt-4">{payError}</Alert>}
              <Button onClick={pay} loading={paying} className="mt-5 w-full">
                {paying ? t('application.redirecting') : t('application.payButton', { price })}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Stripe
              </p>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="font-sans text-base font-semibold">{t('application.progressTitle')}</h2>
            <p className="mt-1 text-sm text-ink-600">{t('application.progressText', { done: requiredDone, total: required.length })}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
              <div
                className={cx('h-full rounded-full transition-all', requiredDone === required.length ? 'bg-emerald-500' : 'bg-brand-600')}
                style={{ width: `${(requiredDone / required.length) * 100}%` }}
              />
            </div>
            <ul className="mt-4 space-y-2">
              {DOCUMENT_TYPES.map((spec) => {
                const s = docState(byType[spec.type]);
                return (
                  <li key={spec.type} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-ink-700">{t(`documents.${spec.type}.name`)}</span>
                    <span className={cx(
                      'text-xs font-medium',
                      s === 'passed' ? 'text-emerald-600' : s === 'issues' ? 'text-amber-600' : s === 'error' ? 'text-red-600' : s === 'pending' ? 'text-sky-600' : 'text-ink-400'
                    )}>
                      {s === 'empty' ? t('validation.notUploaded') : t(`validation.${s}`)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="font-sans text-base font-semibold">{t('application.reviewTitle')}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">{t('application.reviewText')}</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
