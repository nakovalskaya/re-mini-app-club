type HeroPanelProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export function HeroPanel({ eyebrow, title, subtitle }: HeroPanelProps) {
  return (
    <section className="relative -mx-screen min-h-[20.5rem] overflow-hidden text-bg-base">
      <img
        src="/hero/reaction-hero.png"
        alt={title}
        width={1280}
        height={720}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="hero-panel-overlay pointer-events-none absolute inset-0" />
      <div className="hero-panel-side-overlay pointer-events-none absolute inset-0" />

      <div className="relative flex min-h-[20.5rem] items-start px-screen pt-7">
        <div className="max-w-[12rem]">
          {eyebrow ? (
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[rgba(255,227,204,0.88)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-[8ch] text-balance font-serif text-[3.05rem] leading-[0.88] text-[#fff8f2]">
            {title}
          </h1>
          <p className="mt-3 whitespace-nowrap text-[15px] leading-[1.4] text-[rgba(255,244,238,0.86)]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="hero-panel-fade pointer-events-none absolute inset-x-0 bottom-0 h-[7.8rem]" />
    </section>
  );
}
