import { Loader2 } from 'lucide-react';
import { cx } from './cx';

export default function Spinner({ className }) {
  return <Loader2 className={cx('h-5 w-5 animate-spin text-brand-600', className)} aria-hidden="true" />;
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <Spinner className="h-7 w-7" />
    </div>
  );
}
