import { cn } from "@/shared/utils/cn";

type LoadingScreenProps = {
  caption?: string;
  variant?: "inline" | "boot";
  fadingOut?: boolean;
};

const ORBIT_ROTATIONS = [0, 60, 120];

const ATOM_VARIANT_CLASS = {
  inline: "atom-loader atom-loader--inline",
  boot: "atom-loader atom-loader--boot",
  mini: "atom-loader atom-loader--mini"
} as const;

const ATOM_TRACE_CLASS = [
  "atom-orbit-trace atom-orbit-trace-1",
  "atom-orbit-trace atom-orbit-trace-2",
  "atom-orbit-trace atom-orbit-trace-3"
] as const;

export function AtomLoader({
  variant,
  caption
}: {
  variant: "inline" | "boot" | "mini";
  caption?: string;
}) {
  return (
    <div
      className={ATOM_VARIANT_CLASS[variant]}
      role="status"
      aria-label={caption ?? "Загрузка"}
    >
      <svg viewBox="0 0 140 140" aria-hidden="true">
        {ORBIT_ROTATIONS.map((rotation, index) => (
          <g key={rotation} transform={`rotate(${rotation} 70 70)`}>
            <ellipse className="atom-orbit-track" cx="70" cy="70" rx="58" ry="24" />
            <ellipse
              className={ATOM_TRACE_CLASS[index]}
              cx="70"
              cy="70"
              rx="58"
              ry="24"
              pathLength={100}
            />
          </g>
        ))}
      </svg>
      <span className="atom-core" />
    </div>
  );
}

export function LoadingScreen({ caption, variant = "inline", fadingOut = false }: LoadingScreenProps) {
  if (variant === "boot") {
    return (
      <div
        className={cn(
          "loading-boot-screen flex flex-col items-center justify-center gap-5",
          fadingOut && "loading-boot-screen-out"
        )}
      >
        <AtomLoader variant="boot" caption={caption} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <AtomLoader variant="inline" caption={caption} />
    </div>
  );
}
