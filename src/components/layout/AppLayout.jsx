import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutGrid, LogOut, ShieldCheck } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAuth } from '../../lib/auth';
import Logo from '../Logo';
import LanguageSwitcher from '../LanguageSwitcher';
import { cx } from '../ui/cx';

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';
}

function UserMenu() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.account')}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-ink-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {initials(user?.fullName)}
        </span>
        <ChevronDown className="h-4 w-4 text-ink-500" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 animate-fade-up rounded-xl border border-ink-100 bg-white p-1.5 shadow-lift">
          <div className="border-b border-ink-100 px-3 pb-3 pt-2">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.fullName}</p>
            <p className="truncate text-sm text-ink-500">{user?.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppLayout() {
  const { t } = useI18n();
  const { user } = useAuth();

  const navClass = ({ isActive }) =>
    cx(
      'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-ink-100 text-ink-950' : 'text-ink-600 hover:text-ink-950'
    );

  return (
    <div className="min-h-screen bg-ink-50/70">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo to="/dashboard" />
            <nav className="hidden items-center gap-1 sm:flex" aria-label="App">
              <NavLink to="/dashboard" className={navClass}>
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                {t('nav.dashboard')}
              </NavLink>
              {user?.isAdmin && (
                <NavLink to="/admin" className={navClass}>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {t('nav.admin')}
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            {user?.isAdmin && (
              <NavLink to="/admin" className={cx(navClass({ isActive: false }), 'sm:hidden')} aria-label={t('nav.admin')}>
                <ShieldCheck className="h-4 w-4" />
              </NavLink>
            )}
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="container-page py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
