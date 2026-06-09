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

// TEMPORARY — sample covers used to preview "darkened image background"
// look. About 1 in 5 podcast cards gets one (deterministic by id hash). When
// the design is approved we remove this and just use material.coverImage.
const PREVIEW_COVERS = [
  "https://images.unsplash.com/photo-1574615552620-7c12fea2f3e2?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1200&q=70"
];

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function PodcastCard({ material, featured = false }: PodcastCardProps) {
  const navigate = useNavigate();
  const isScheduled = material.status === "scheduled";
  // Meta on the card: only duration if set. The "Подкаст" type label is
  // already implied by the mic + waveform — no need to repeat it in text.
  // "Скоро" lives in the top-left badge.
  const meta = [material.duration].filter(Boolean);
  const hasTopLeftBadge = featured || isScheduled;

  // TEMPORARY for the visual preview the editor asked for: only ~1 in 5 cards
  // gets a (preview) cover, the rest stay plain. Once the look is approved
  // this becomes `material.coverImage` (whatever Notion has).
  const hash = hashCode(material.id);
  const coverImage =
    hash % 5 === 0 ? PREVIEW_COVERS[hash % PREVIEW_COVERS.length] : null;

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
      {coverImage ? (
        <>
          <img
            src={coverImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="podcast-card-image-tint pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
        </>
      ) : null}

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
