import { useNavigate } from "react-router-dom";
import { CoverImage } from "@/components/CoverImage/CoverImage";
import { FavoriteButton } from "@/components/FavoriteButton/FavoriteButton";
import type { Material } from "@/shared/types/content";
import { getCoverImageUrl } from "@/shared/utils/images";

type MaterialCardProps = {
  material: Material;
  featured?: boolean;
};

export function MaterialCard({
  material,
  featured = false
}: MaterialCardProps) {
  const navigate = useNavigate();
  const isScheduled = material.status === "scheduled";
  const typeLabelByType: Record<Material["type"], string> = {
    lesson: "Лекция",
    course: "Курс",
    live: "Эфир",
    podcast: "Подкаст",
    guide: "Гайд",
    article: "Статья",
    manual: "Методичка"
  };
  const isTextMaterial =
    material.type === "guide" || material.type === "article" || material.type === "manual";
  // Meta on the card: type label + duration (if set). "Скоро" lives in the
  // top-left badge; we don't duplicate it in the meta row.
  const meta = [
    typeLabelByType[material.type],
    !isTextMaterial ? material.duration : ""
  ].filter(Boolean);
  const imageSrc = getCoverImageUrl(material.coverImage);

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
      className="surface-card material-image-frame relative block overflow-hidden aspect-[1920/1350] w-full"
    >
      <CoverImage
        src={imageSrc}
        alt={material.title}
        width={1920}
        height={1350}
        loading={featured ? "eager" : "lazy"}
        fetchPriority={featured ? "high" : "auto"}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${featured ? "material-image-eager" : ""}`}
      />

      {/* Bottom scrim — fades into the card's surface color so the text sits on a
          shaded "plaque" that visually belongs to the card, not a hard cut. */}
      <div className="material-card-scrim pointer-events-none absolute inset-x-0 bottom-0" />

      <FavoriteButton materialId={material.id} className="absolute right-4 top-4 z-[2]" />

      {featured ? (
        <div className="material-tag-featured chip-label absolute left-4 top-4 z-[2] rounded-full px-3 py-1">
          Рекомендуем
        </div>
      ) : null}
      {isScheduled ? (
        <div className={`material-tag-scheduled chip-label absolute ${featured ? "left-4 top-14" : "left-4 top-4"} z-[2] rounded-full px-3 py-1`}>
          Скоро
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-[1] space-y-1.5 p-card">
        <div className="type-meta flex flex-wrap items-center gap-2">
          {meta.map((item, index) => (
            <div key={`${material.id}-meta-${item}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 ? <span className="h-1 w-1 rounded-full bg-border-medium" /> : null}
              <span>{item}</span>
            </div>
          ))}
        </div>
        <h3
          className={`text-balance text-text-primary ${featured ? "font-serif text-[1.42rem] leading-[1]" : "font-serif text-[1.22rem] leading-[1]"}`}
        >
          {material.title}
        </h3>
        <p className="type-body line-clamp-2">
          {material.shortDescription}
        </p>
      </div>
    </article>
  );
}
