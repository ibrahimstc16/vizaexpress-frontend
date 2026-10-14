import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LANGUAGES } from '../config/site';
import { useI18n } from '../i18n';
import { cx } from './ui/cx';

export default function LanguageSwitcher({ align = 'right', inverted = false, className }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.language')}
        className={cx(
          'inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors',
          inverted ? 'text-ink-200 hover:bg-white/10 hover:text-white' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
        )}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        {current.short}
        <ChevronDown className={cx('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t('common.language')}
          className={cx(
            'absolute z-50 mt-2 w-48 animate-fade-up overflow-hidden rounded-xl border border-ink-100 bg-white p-1.5 shadow-lift',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cx(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm',
                  l.code === lang ? 'bg-brand-50 font-semibold text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                )}
              >
                {l.label}
                {l.code === lang && <Check className="h-4 w-4" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
