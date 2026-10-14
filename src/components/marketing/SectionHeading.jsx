import { cx } from '../ui/cx';

export default function SectionHeading({ eyebrow, title, subtitle, center = false, inverted = false }) {
  return (
    <div className={cx('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <p className={cx('eyebrow', inverted && 'text-brand-300')}>{eyebrow}</p>}
      <h2 className={cx('mt-3 text-3xl font-bold leading-tight sm:text-4xl', inverted && 'text-white')}>{title}</h2>
      {subtitle && <p className={cx('mt-4 text-lg leading-relaxed', inverted ? 'text-ink-300' : 'text-ink-600')}>{subtitle}</p>}
    </div>
  );
}
