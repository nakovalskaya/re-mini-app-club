type HeroPanelProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export function HeroPanel({ eyebrow, title, subtitle }: HeroPanelProps) {
  return (
    <section className="hero-panel-shell relative -mx-screen min-h-[7.6rem] text-bg-base">
      <div className="relative flex min-h-[7.6rem] items-start px-screen pt-3">
        <div className="max-w-[13rem]">
          {eyebrow ? (
            <p className="type-page-eyebrow mb-3 text-[rgba(255,227,204,0.88)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-[8ch] text-balance font-serif text-[2.72rem] leading-[0.9]">
            {title}
          </h1>
          <p className="mt-1.5 whitespace-nowrap text-[15px] font-light leading-[1.4] text-[rgba(255,244,238,0.86)]">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
