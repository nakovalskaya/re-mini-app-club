import { useNavigate } from "react-router-dom";
import { Microphone } from "@phosphor-icons/react";
import { FavoriteButton } from "@/components/FavoriteButton/FavoriteButton";
import type { Material } from "@/shared/types/content";

type PodcastCardProps = {
  material: Material;
  featured?: boolean;
};

// Calm waveform — fewer bars with wide gaps, uniform colour, irregular
// heights only. No opacity tricks, no clutter — reads as a quiet "this is
// audio" mark rather than a busy equaliser.
const BARS: ReadonlyArray<number> = [
  35, 70, 20, 55, 90, 28, 48, 72, 16, 60,
  44, 82, 24, 52, 36, 68, 22, 58, 40, 76, 18, 50
];

export function PodcastCard({ material, featured = false }: PodcastCardProps) {
  const navigate = useNavigate();
  const isScheduled = material.status === "scheduled";
  // Meta on the card: only duration if set. The "Подкаст" type label is
  // already implied by the mic + waveform — no need to repeat it in text.
  // "Скоро" lives in the top-left badge.
  const meta = [material.duration].filter(Boolean);
  const hasTopLeftBadge = featured || isScheduled;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/materials/${material.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/materials/${material.id}`);
        }
      }}
      className="podcast-card surface-card relative block w-full overflow-hidden px-4 py-3.5"
    >
      <FavoriteButton materialId={material.id} className="absolute right-3 top-3 z-[3]" />

      {featured ? (
        <div className="material-tag-featured chip-label absolute left-3 top-3 z-[3] rounded-full px-3 py-1">
          Рекомендуем
        </div>
      ) : null}
      {isScheduled ? (
        <div
          className={`material-tag-scheduled chip-label absolute ${featured ? "left-3 top-12" : "left-3 top-3"} z-[3] rounded-full px-3 py-1`}
        >
          Скоро
        </div>
      ) : null}

      <div
        className={`relative z-[1] flex flex-col gap-2.5 ${
          hasTopLeftBadge ? "pt-7" : ""
        }`}
      >
        {/* Mic + waveform — compact, bottom-aligned bars with varied heights
            and mixed opacities. Right edge fades into the card so the wave
            looks like it continues. */}
        <div className="flex items-end gap-2 pr-11">
          <Microphone
            size={22}
            weight="fill"
            className="podcast-card-mic shrink-0"
          />
          <div
            className="podcast-waveform flex h-5 flex-1 items-end gap-[5px] overflow-hidden"
            aria-hidden="true"
          >
            {BARS.map((h, index) => (
              <span
                key={`${material.id}-bar-${index}`}
                className="podcast-waveform-bar shrink-0"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="type-meta flex flex-wrap items-center gap-2">
            {meta.map((item, index) => (
              <div
                key={`${material.id}-meta-${item}-${index}`}
                className="inline-flex items-center gap-2"
              >
                {index > 0 ? (
                  <span className="h-1 w-1 rounded-full bg-border-medium" />
                ) : null}
                <span>{item}</span>
              </div>
            ))}
          </div>
          <h3
            className={`text-balance text-text-primary ${
              featured
                ? "font-serif text-[1.32rem] leading-[1.02]"
                : "font-serif text-[1.16rem] leading-[1.04]"
            }`}
          >
            {material.title}
          </h3>
          <p className="type-body line-clamp-2">{material.shortDescription}</p>
        </div>
      </div>
    </article>
  );
}
