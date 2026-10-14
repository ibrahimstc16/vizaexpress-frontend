import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../ui/cx';

export default function FaqList({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white shadow-card">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3 className="font-sans">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-base font-semibold text-ink-900 hover:text-brand-700"
              >
                {item.q}
                <ChevronDown className={cx('h-5 w-5 shrink-0 text-ink-400 transition-transform', isOpen && 'rotate-180 text-brand-600')} aria-hidden="true" />
              </button>
            </h3>
            {isOpen && (
              <div id={`faq-${i}`} className="-mt-1 px-6 pb-6 text-[15px] leading-relaxed text-ink-600">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
