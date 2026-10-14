import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Mail, Phone } from 'lucide-react';
import { adminApi, documentsApi, errorMessage } from '../services/api';
import { useI18n } from '../i18n';
import { DOCUMENT_TYPES } from '../config/site';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Badge, { StatusBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import DocIcon from '../components/marketing/DocIcon';
import { ADMIN_STATUS, PLAN_NAMES, formatDateTime } from './admin/shared';

const DOC_NAMES = {
  passport: 'Pasaport',
  photo: 'Biyometrik fotoğraf',
  residence_proof: 'Adres belgesi',
  insurance: 'Sağlık sigortası',
  work_contract: 'İş sözleşmesi',
  application_form: 'Başvuru formu',
};
const VALIDATION = {
  passed: { tone: 'success', label: 'Uygun' },
  issues: { tone: 'warning', label: 'Sorunlu' },
  error: { tone: 'danger', label: 'Kontrol edilemedi' },
  pending: { tone: 'info', label: 'Kontrol ediliyor' },
};

function parse(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function AdminApplicationDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.application(id);
      setApplication(data.application);
      setNextStatus(data.application.status || 'created');
      setDocuments(data.documents || []);
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const saveStatus = async () => {
    setSaving(true);
    setNotice('');
    setError('');
    try {
      await adminApi.updateStatus(id, nextStatus);
      setApplication((a) => ({ ...a, status: nextStatus }));
      setNotice('Durum güncellendi ve başvurana e-posta gönderildi.');
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setSaving(false);
    }
  };

  const view = async (doc) => {
    const win = window.open('', '_blank');
    try {
      const res = await documentsApi.file(doc.id);
      const url = URL.createObjectURL(res.data);
      if (win) win.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      win?.close();
      setError(err.response?.status === 410 ? 'Bu dosya sunucuda artık yok (yeniden dağıtımda silinmiş olabilir).' : errorMessage(err, t));
    }
  };

  if (loading) return <PageSpinner />;
  if (!application) return <Alert tone="error">{error || 'Başvuru bulunamadı.'}</Alert>;

  const byType = Object.fromEntries(documents.map((d) => [d.document_type, d]));
  const status = application.status || 'created';

  return (
    <div className="animate-fade-up">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Tüm başvurular
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{application.full_name}</h1>
              <StatusBadge status={status} label={ADMIN_STATUS[status] || status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
              <a href={`mailto:${application.email}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {application.email}
              </a>
              {application.phone && (
                <a href={`tel:${application.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {application.phone}
                </a>
              )}
            </div>
            <dl className="mt-5 grid gap-4 border-t border-ink-100 pt-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-ink-500">Paket</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">{PLAN_NAMES[application.package_type] || application.package_type}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Oluşturulma</dt>
                <dd className="mt-0.5 font-semibold text-ink-900">{formatDateTime(application.created_at)}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Başvuru no</dt>
                <dd className="mt-0.5 font-mono text-xs font-semibold text-ink-900">{String(application.id)}</dd>
              </div>
            </dl>
          </Card>

          {error && <Alert tone="error">{error}</Alert>}

          <div>
            <h2 className="text-lg font-bold">Belgeler ({documents.length})</h2>
            <div className="mt-4 space-y-3">
              {DOCUMENT_TYPES.map((spec) => {
                const doc = byType[spec.type];
                const result = parse(doc?.ai_validation_result);
                const v = doc ? VALIDATION[doc.ai_validation_status] || VALIDATION.pending : null;
                return (
                  <Card key={spec.type} className="p-5">
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-500">
                        <DocIcon type={spec.type} className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-sans text-base font-semibold">{DOC_NAMES[spec.type]}</h3>
                          {!spec.required && <Badge>İsteğe bağlı</Badge>}
                          {v ? <Badge tone={v.tone}>{v.label}</Badge> : <Badge>Yüklenmedi</Badge>}
                          {result?.score > 0 && <span className="text-xs text-ink-500">Puan {result.score}/100</span>}
                        </div>
                        {doc && (
                          <>
                            <p className="mt-1 truncate text-sm text-ink-500">{doc.original_filename} · {formatDateTime(doc.created_at)}</p>
                            {result?.summary && <p className="mt-2 text-sm text-ink-700">{result.summary}</p>}
                            {Array.isArray(result?.issues) && result.issues.length > 0 && (
                              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-amber-800">
                                {result.issues.map((i, n) => <li key={n}>{typeof i === 'string' ? i : i?.message}</li>)}
                              </ul>
                            )}
                          </>
                        )}
                      </div>
                      {doc && (
                        <Button size="sm" variant="secondary" onClick={() => view(doc)}>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          Görüntüle
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-5">
            <h2 className="font-sans text-base font-semibold">Durumu güncelle</h2>
            <p className="mt-1 text-sm text-ink-600">Başvurana durum değişikliği e-postayla bildirilir.</p>
            <div className="mt-4 space-y-2" role="radiogroup" aria-label="Durum">
              {Object.entries(ADMIN_STATUS).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50/60">
                  <input type="radio" name="status" value={key} checked={nextStatus === key} onChange={() => setNextStatus(key)} className="accent-brand-600" />
                  {label}
                </label>
              ))}
            </div>
            {notice && <Alert tone="success" className="mt-4">{notice}</Alert>}
            <Button onClick={saveStatus} loading={saving} disabled={nextStatus === status} className="mt-4 w-full">
              Kaydet
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
