import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cx } from './cx';

const tones = {
  error: { cls: 'bg-red-50 text-red-800 ring-red-200', Icon: AlertCircle },
  success: { cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200', Icon: CheckCircle2 },
  warning: { cls: 'bg-amber-50 text-amber-900 ring-amber-200', Icon: TriangleAlert },
  info: { cls: 'bg-brand-50 text-brand-900 ring-brand-200', Icon: Info },
};

export default function Alert({ tone = 'info', title, children, className, action }) {
  const { cls, Icon } = tones[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex gap-3 rounded-xl p-3.5 text-sm ring-1 ring-inset', cls, className)}>
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cx(title && 'mt-0.5', 'leading-relaxed')}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
