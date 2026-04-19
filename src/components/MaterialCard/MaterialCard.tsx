import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { FavoriteButton } from "@/components/FavoriteButton/FavoriteButton";
import type { Material } from "@/shared/types/content";

type MaterialCardProps = {
  material: Material;
  featured?: boolean;
};

export function MaterialCard({
  material,
  featured = false
}: MaterialCardProps) {
  const navigate = useNavigate();
  const typeLabelByType: Record<Material["type"], string> = {
    lesson: "Урок",
    live: "Эфир",
    podcast: "Подкаст",
    guide: "Гайд",
    article: "Статья"
  };
  const isTextMaterial = material.type === "guide" || material.type === "article";
  const meta = [typeLabelByType[material.type], !isTextMaterial ? material.duration : ""].filter(Boolean);

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
      className="surface-card pressable block overflow-hidden"
    >
      <div className="relative">
        <img
          src={material.coverImage}
          alt={material.title}
          className={`w-full object-cover ${featured ? "h-52" : "h-44"}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(38,4,4,0.16)] to-transparent" />
        <FavoriteButton materialId={material.id} className="absolute right-4 top-4" />
        {featured ? (
          <div className="absolute bottom-4 left-4 rounded-full bg-[rgba(255,242,220,0.92)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            Рекомендуем
          </div>
        ) : null}
      </div>
      <div className="space-y-3 p-card">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-secondary">
            {meta.map((item, index) => (
              <div key={`${material.id}-meta-${item}-${index}`} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="h-1 w-1 rounded-full bg-border-medium" /> : null}
                <span>{item}</span>
              </div>
            ))}
          </div>
          <h3
            className={`text-balance text-text-primary ${featured ? "font-serif text-[1.64rem] leading-[0.95]" : "font-serif text-[1.42rem] leading-[0.95]"}`}
          >
            {material.title}
          </h3>
          <p className="text-[13px] leading-5 text-text-secondary">
            {material.shortDescription}
          </p>
        </div>
        <Button
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            navigate(`/materials/${material.id}`);
          }}
        >
          Смотреть
        </Button>
      </div>
    </article>
  );
}
