import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useI18n } from '../../i18n';
import { SITE } from '../../config/site';
import Logo from '../Logo';

export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t('footer.product'),
      links: [
        { to: '/how-it-works', label: t('nav.howItWorks') },
        { to: '/pricing', label: t('nav.pricing') },
        { to: '/faq', label: t('nav.faq') },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { to: '/about', label: t('nav.about') },
        { to: '/contact', label: t('nav.contact') },
      ],
    },
    {
      title: t('footer.support'),
      links: [
        { to: '/login', label: t('nav.login') },
        { to: '/register', label: t('nav.getStarted') },
      ],
    },
  ];

  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-600">{t('footer.tagline')}</p>
            <a href={`mailto:${SITE.supportEmail}`} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-brand-700">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {SITE.supportEmail}
            </a>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-sans text-sm font-semibold text-ink-900">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-ink-600 hover:text-ink-950">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-ink-200/70 pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-ink-500">{t('footer.disclaimer')}</p>
          <p className="mt-3 text-xs text-ink-500">© {year} {SITE.name}. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
