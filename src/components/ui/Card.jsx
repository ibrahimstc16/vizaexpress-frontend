import { cx } from './cx';

export default function Card({ className, children, ...props }) {
  return (
    <div className={cx('rounded-2xl border border-ink-100 bg-white shadow-card', className)} {...props}>
      {children}
    </div>
  );
}
