import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cx } from './cx';

const inputBase =
  'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-ink-900 shadow-sm transition placeholder:text-ink-400 focus:outline-none focus:ring-4';

function inputState(error) {
  return error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
    : 'border-ink-200 hover:border-ink-300 focus:border-brand-500 focus:ring-brand-100';
}

export function Field({ label, optionalLabel, hint, error, children, id }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-ink-800">
          <span>{label}</span>
          {optionalLabel && <span className="text-xs font-normal text-ink-400">{optionalLabel}</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, optionalLabel, hint, error, className, type = 'text', ...props }) {
  const id = useId();
  return (
    <Field id={id} label={label} optionalLabel={optionalLabel} hint={hint} error={error}>
      <input
        id={id}
        type={type}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cx(inputBase, inputState(error), className)}
        {...props}
      />
    </Field>
  );
}

export function PasswordInput({ label, hint, error, showLabel, hideLabel, ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cx(inputBase, inputState(error), 'pr-11')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ink-400 hover:text-ink-700"
          aria-label={visible ? hideLabel : showLabel}
        >
          {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </Field>
  );
}

export function Textarea({ label, hint, error, className, ...props }) {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        aria-invalid={!!error}
        className={cx(inputBase, inputState(error), 'min-h-[140px] resize-y', className)}
        {...props}
      />
    </Field>
  );
}
