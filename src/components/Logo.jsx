import { Link } from 'react-router-dom';
import { cx } from './ui/cx';

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cx('h-8 w-8', className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#2550EB" />
      <path d="M9 10.5h3.2l3.8 9.3 3.8-9.3H23L17.6 22h-3.2z" fill="#fff" />
      <circle cx="23.5" cy="21.5" r="2" fill="#93B6FD" />
    </svg>
  );
}

export default function Logo({ to = '/', inverted = false, className }) {
  return (
    <Link to={to} className={cx('flex items-center gap-2.5 rounded-lg', className)} aria-label="VizaExpress">
      <LogoMark />
      <span className={cx('font-display text-[19px] font-bold tracking-tight', inverted ? 'text-white' : 'text-ink-950')}>
        Viza<span className={inverted ? 'text-brand-300' : 'text-brand-600'}>Express</span>
      </span>
    </Link>
  );
}
