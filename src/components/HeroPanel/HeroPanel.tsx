type HeroPanelProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export function HeroPanel({ eyebrow, title, subtitle }: HeroPanelProps) {
  return (
    <section className="relative -mx-screen min-h-[20.5rem] overflow-hidden text-bg-base">
      <img
        src="/hero/reaction-hero.jpg"
        alt={title}
        width={1280}
        height={720}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(36,7,7,0.14)_0%,rgba(36,7,7,0.08)_22%,rgba(36,7,7,0.12)_48%,rgba(250,244,244,0.14)_70%,rgba(250,244,244,0.62)_84%,#faf4f4_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_24%),linear-gradient(90deg,rgba(31,5,5,0.22)_0%,rgba(31,5,5,0.1)_26%,transparent_54%)]" />

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
          <p className="mt-3 max-w-[16ch] text-[15px] leading-[1.4] text-[rgba(255,244,238,0.86)]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(250,244,244,0)_0%,rgba(250,244,244,0.28)_30%,rgba(250,244,244,0.74)_68%,#faf4f4_100%)]" />
    </section>
  );
}
