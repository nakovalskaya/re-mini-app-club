type LoadingScreenProps = {
  caption?: string;
  variant?: "inline" | "boot";
};

const ORBIT_ROTATIONS = [0, 60, 120];

function AtomLoader({ variant, caption }: { variant: "inline" | "boot"; caption?: string }) {
  return (
    <div
      className={`atom-loader atom-loader--${variant}`}
      role="status"
      aria-label={caption ?? "Загрузка"}
    >
      <svg viewBox="0 0 140 140" aria-hidden="true">
        <defs>
          <filter id="atom-orbit-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {ORBIT_ROTATIONS.map((rotation, index) => (
          <g key={rotation} transform={`rotate(${rotation} 70 70)`}>
            <ellipse className="atom-orbit-track" cx="70" cy="70" rx="58" ry="24" />
            <ellipse
              className={`atom-orbit-trace atom-orbit-trace-${index + 1}`}
              cx="70"
              cy="70"
              rx="58"
              ry="24"
              pathLength={100}
              filter="url(#atom-orbit-glow)"
            />
          </g>
        ))}
      </svg>
      <span className="atom-core" />
    </div>
  );
}

export function LoadingScreen({ caption, variant = "inline" }: LoadingScreenProps) {
  if (variant === "boot") {
    return (
      <div className="loading-boot-screen flex flex-col items-center justify-center gap-5">
        <AtomLoader variant="boot" caption={caption} />
        {caption ? <p className="type-body text-center">{caption}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <AtomLoader variant="inline" caption={caption} />
      {caption ? <p className="type-body text-center">{caption}</p> : null}
    </div>
  );
}
