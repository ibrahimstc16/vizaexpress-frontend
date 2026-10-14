import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useI18n } from '../../i18n';
import { useAuth } from '../../lib/auth';
import Logo from '../Logo';
import LanguageSwitcher from '../LanguageSwitcher';
import Button from '../ui/Button';
import { cx } from '../ui/cx';

const links = [
  { to: '/how-it-works', key: 'nav.howItWorks' },
  { to: '/pricing', key: 'nav.pricing' },
  { to: '/faq', key: 'nav.faq' },
  { to: '/about', key: 'nav.about' },
  { to: '/contact', key: 'nav.contact' },
];

export default function SiteHeader() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  // The mobile menu remembers the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState(null);
  const open = openOn === location.pathname;
  const setOpen = (fn) => setOpenOn((fn(open) ? location.pathname : null));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cx(
        'sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md transition-colors',
        scrolled ? 'border-ink-100' : 'border-transparent'
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cx(
                  'rounded-lg px-3 py-2 text-[15px] font-medium transition-colors',
                  isActive ? 'text-ink-950' : 'text-ink-600 hover:text-ink-950'
                )
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          {user ? (
            <Button to="/dashboard" size="sm">{t('nav.dashboard')}</Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">{t('nav.login')}</Button>
              <Button to="/register" size="sm">{t('nav.getStarted')}</Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-100"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3" aria-label="Mobile">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx('rounded-lg px-3 py-3 text-base font-medium', isActive ? 'bg-ink-50 text-ink-950' : 'text-ink-700')
                }
              >
                {t(l.key)}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-100 pt-4">
              {user ? (
                <Button to="/dashboard" className="col-span-2">{t('nav.dashboard')}</Button>
              ) : (
                <>
                  <Button to="/login" variant="secondary">{t('nav.login')}</Button>
                  <Button to="/register">{t('nav.getStarted')}</Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
