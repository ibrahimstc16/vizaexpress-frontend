import { CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../i18n';
import Logo from '../Logo';
import LanguageSwitcher from '../LanguageSwitcher';

export default function AuthLayout({ title, subtitle, children, footer }) {
  const { t } = useI18n();
  const points = t('auth.side.points');

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(420px,0.85fr)]">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <LanguageSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[400px] animate-fade-up">
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-ink-600">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-ink-600">{footer}</div>}
          </div>
        </div>
      </div>
      <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(59,106,246,0.4),transparent)]" aria-hidden="true" />
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">{t('auth.side.title')}</h2>
          <ul className="mt-8 space-y-4">
            {Array.isArray(points) &&
              points.map((p) => (
                <li key={p} className="flex gap-3 text-[17px] text-ink-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" aria-hidden="true" />
                  {p}
                </li>
              ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
