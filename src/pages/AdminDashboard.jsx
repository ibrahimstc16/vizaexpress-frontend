import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, ChevronRight, Files, FolderOpen, Search, Users } from 'lucide-react';
import { adminApi, errorMessage } from '../services/api';
import { useI18n } from '../i18n';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { PageSpinner } from '../components/ui/Spinner';
import { cx } from '../components/ui/cx';
import { ADMIN_STATUS, PLAN_NAMES, formatDateTime } from './admin/shared';

function Stat({ Icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-ink-500">{label}</p>
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-ink-950">{value}</p>
    </Card>
  );
}

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('applications');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, a, u] = await Promise.all([adminApi.stats(), adminApi.applications(), adminApi.users()]);
      setStats(s.data);
      setApplications(a.data.applications || []);
      setUsers(u.data.users || []);
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const q = query.trim().toLowerCase();
  const filteredApps = useMemo(
    () =>
      applications.filter(
        (a) =>
          (status === 'all' || (a.status || 'created') === status) &&
          (!q || `${a.full_name} ${a.email}`.toLowerCase().includes(q))
      ),
    [applications, status, q]
  );
  const filteredUsers = useMemo(
    () => users.filter((u) => !q || `${u.full_name} ${u.email} ${u.phone || ''}`.toLowerCase().includes(q)),
    [users, q]
  );

  if (loading) return <PageSpinner />;

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-bold">Yönetim paneli</h1>
      <p className="mt-1.5 text-ink-600">Başvuruları inceleyin, durumlarını güncelleyin.</p>

      {error && (
        <Alert tone="error" className="mt-6" action={<Button size="sm" variant="secondary" onClick={load}>Tekrar dene</Button>}>
          {error}
        </Alert>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat Icon={Users} label="Kullanıcılar" value={stats?.totalUsers ?? 0} />
        <Stat Icon={FolderOpen} label="Başvurular" value={stats?.totalApplications ?? 0} />
        <Stat Icon={Banknote} label="Ödenen başvurular" value={stats?.paidApplications ?? 0} />
        <Stat Icon={Files} label="Yüklenen belgeler" value={stats?.totalDocuments ?? 0} />
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex gap-1 rounded-xl bg-ink-100 p-1">
            {[
              ['applications', `Başvurular (${applications.length})`],
              ['users', `Kullanıcılar (${users.length})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cx('rounded-lg px-3.5 py-1.5 text-sm font-semibold', tab === key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-600 hover:text-ink-900')}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {tab === 'applications' && (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
                aria-label="Duruma göre filtrele"
              >
                <option value="all">Tüm durumlar</option>
                {Object.entries(ADMIN_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            )}
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="İsim veya e-posta ara"
                className="h-10 w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 sm:w-64"
              />
            </label>
          </div>
        </div>

        {tab === 'applications' ? (
          filteredApps.length === 0 ? (
            <p className="px-6 py-14 text-center text-ink-500">Gösterilecek başvuru yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-ink-50/80 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-5 py-3">Başvuran</th>
                    <th className="px-5 py-3">Paket</th>
                    <th className="px-5 py-3">Durum</th>
                    <th className="px-5 py-3">Belgeler</th>
                    <th className="px-5 py-3">Tarih</th>
                    <th className="px-5 py-3"><span className="sr-only">Aç</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {filteredApps.map((a) => (
                    <tr key={a.id} className="hover:bg-ink-50/60">
                      <td className="px-5 py-4">
                        <p className="font-medium text-ink-900">{a.full_name}</p>
                        <p className="text-ink-500">{a.email}</p>
                      </td>
                      <td className="px-5 py-4 text-ink-700">{PLAN_NAMES[a.package_type] || a.package_type}</td>
                      <td className="px-5 py-4"><StatusBadge status={a.status || 'created'} label={ADMIN_STATUS[a.status || 'created'] || a.status} /></td>
                      <td className="px-5 py-4 text-ink-700">{a.document_count}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink-500">{formatDateTime(a.created_at)}</td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/admin/application/${a.id}`} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                          İncele
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredUsers.length === 0 ? (
          <p className="px-6 py-14 text-center text-ink-500">Gösterilecek kullanıcı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-ink-50/80 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Kullanıcı</th>
                  <th className="px-5 py-3">Telefon</th>
                  <th className="px-5 py-3">Başvuru</th>
                  <th className="px-5 py-3">Kayıt tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink-900">
                        {u.full_name}
                        {u.is_admin && <span className="ml-2 rounded-full bg-ink-900 px-2 py-0.5 text-[11px] font-semibold text-white">Admin</span>}
                      </p>
                      <p className="text-ink-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-700">{u.phone || '–'}</td>
                    <td className="px-5 py-4 text-ink-700">{u.application_count}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-ink-500">{formatDateTime(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
