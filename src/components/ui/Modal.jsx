import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, description, children, closeLabel = 'Close', size = 'max-w-lg' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  // Portal to <body> so animated (transformed) parents do not trap the fixed overlay.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative max-h-[92vh] w-full ${size} animate-fade-up overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift focus:outline-none sm:rounded-2xl sm:p-7`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          aria-label={closeLabel}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="modal-title" className="pr-8 text-xl font-bold">{title}</h2>
        {description && <p className="mt-1.5 text-[15px] text-ink-500">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
