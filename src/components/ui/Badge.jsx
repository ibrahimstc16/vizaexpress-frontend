import { cx } from './cx';

const tones = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200/60',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200/70',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200/70',
  danger: 'bg-red-50 text-red-700 ring-red-200/70',
  info: 'bg-sky-50 text-sky-700 ring-sky-200/70',
};

export default function Badge({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

const statusTone = {
  created: 'warning',
  draft: 'neutral',
  paid: 'brand',
  pending: 'info',
  reviewing: 'info',
  approved: 'success',
  rejected: 'danger',
};

export function StatusBadge({ status, label }) {
  return (
    <Badge tone={statusTone[status] || 'neutral'} dot>
      {label}
    </Badge>
  );
}
