export default function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden border-b border-ink-100 bg-gradient-to-b from-brand-50/70 to-white">
      <div className="container-page py-16 sm:py-20">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-5 text-lg leading-relaxed text-ink-600">{subtitle}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
