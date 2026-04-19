type HeroPanelProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function HeroPanel({ eyebrow, title, subtitle }: HeroPanelProps) {
  return (
    <section className="surface-card-elevated relative overflow-hidden rounded-[30px] border-0 bg-accent-deep px-5 py-7 text-bg-base">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,208,148,0.35),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_18%)]" />
      <div className="pointer-events-none absolute -right-10 top-8 h-40 w-40 rounded-full bg-[rgba(255,208,148,0.12)] blur-3xl" />
      <div className="relative">
        <p className="mb-3.5 text-xs font-medium uppercase tracking-[0.28em] text-accent-gold">
          {eyebrow}
        </p>
        <h1 className="max-w-[9ch] text-balance font-serif text-[2.52rem] leading-[0.9] text-[#fff8f2]">
          {title}
        </h1>
        <p className="mt-3.5 max-w-[28ch] text-sm leading-[1.45rem] text-[#f8e8e2]">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
