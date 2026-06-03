import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMaterials } from "@/app/providers/MaterialsProvider";
import { BackButton } from "@/components/BackButton/BackButton";
import { Button } from "@/components/Button/Button";
import { CoverImage } from "@/components/CoverImage/CoverImage";
import { FavoriteButton } from "@/components/FavoriteButton/FavoriteButton";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { TopicPill } from "@/components/TopicPill/TopicPill";
import { openTelegramLink } from "@/features/telegram/telegram";
import { getMaterialById } from "@/features/materials/selectors";
import { topics } from "@/data/topics";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { getCoverImageUrl } from "@/shared/utils/images";
import { cn } from "@/shared/utils/cn";

export function MaterialScreen() {
  const { materials, isLoading } = useMaterials();
  const { id } = useParams();
  const material = id ? getMaterialById(materials, id) : null;

  if (isLoading) {
    return (
      <section className="screen-stack">
        <LoadingScreen caption="Загружаем материал" />
      </section>
    );
  }

  if (!material) {
    return (
      <section className="screen-stack">
        <EmptyState
          title="Материал не найден"
          description="Похоже, этот материал ещё не опубликован в базе."
        />
      </section>
    );
  }

  const materialTopics = topics.filter((topic) => material.topicIds.includes(topic.id));
  const isScheduled = material.status === "scheduled";
  const canOpen = Boolean(material.telegramUrl) && !isScheduled;
  const isTextMaterial =
    material.type === "guide" || material.type === "article" || material.type === "manual";
  const typeLabel = useMemo(() => {
    const labels: Record<string, string> = {
      lesson: "Лекция",
      course: "Курс",
      live: "Эфир",
      podcast: "Подкаст",
      guide: "Гайд",
      article: "Статья",
      manual: "Методичка"
    };

    return labels[material.type] ?? material.type;
  }, [material.type]);
  const openLabel = "Открыть";
  // On the detail page the type already lives in the page eyebrow at the top
  // ("ЭФИР") and the "Скоро" state lives in the badge over the cover, so the
  // meta row only shows duration — and only when it is actually set.
  const metaItems = !isTextMaterial && material.duration ? [material.duration] : [];
  const detailImageSrc = getCoverImageUrl(material.coverImage);

  return (
    <section className="screen-stack pb-10">
      <div className="flex items-center justify-between">
        <BackButton />
        <p className="type-page-eyebrow tracking-[0.22em]">
          {typeLabel}
        </p>
        <div className="w-11" />
      </div>

      <article
        role={canOpen ? "button" : undefined}
        tabIndex={canOpen ? 0 : undefined}
        onClick={() => {
          if (canOpen) {
            openTelegramLink(material.telegramUrl);
          }
        }}
        onKeyDown={(event) => {
          if (!canOpen) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openTelegramLink(material.telegramUrl);
          }
        }}
        className={cn(
          "surface-card material-image-frame relative block overflow-hidden aspect-[1920/1350] w-full",
          canOpen && "cursor-pointer"
        )}
      >
        <CoverImage
          src={detailImageSrc}
          alt={material.title}
          width={1920}
          height={1350}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover material-image-eager"
        />
        {/* Bottom scrim — fades the cover into the dark plaque the text sits on,
            so the UI layer reads as overlaid on the image, not as a separate band. */}
        <div className="material-card-scrim pointer-events-none absolute inset-x-0 bottom-0" />
        <FavoriteButton materialId={material.id} className="absolute right-4 top-4 z-[2]" />
        {isScheduled ? (
          <div className="material-tag-scheduled chip-label absolute left-4 top-4 z-[2] rounded-full px-3 py-1">
            Скоро
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 z-[1] space-y-1.5 p-card">
          {metaItems.length > 0 ? (
            <div className="type-meta flex flex-wrap items-center gap-2">
              {metaItems.map((item, index) => (
                <div key={`${material.id}-detail-meta-${item}-${index}`} className="inline-flex items-center gap-2">
                  {index > 0 ? <span className="h-1 w-1 rounded-full bg-border-medium" /> : null}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : null}
          <h1 className="font-serif text-[1.24rem] leading-[1] text-text-primary">
            {material.title}
          </h1>
          <p className="type-body line-clamp-2">
            {material.shortDescription}
          </p>
        </div>
      </article>

      {materialTopics.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {materialTopics.map((topic) => (
            <TopicPill key={topic.id} label={topic.title} to={`/topic/${topic.slug}`} />
          ))}
        </div>
      ) : null}

      {material.longDescription &&
      material.longDescription !== material.shortDescription ? (
        <div className="surface-card space-y-2 p-card">
          <p className="type-page-description whitespace-pre-line">
            {material.longDescription}
          </p>
        </div>
      ) : null}

      {material.extraDescription &&
      material.extraDescription !== material.shortDescription &&
      material.extraDescription !== material.longDescription ? (
        <div className="surface-card space-y-2 p-card">
          <p className="type-body whitespace-pre-line">
            {material.extraDescription}
          </p>
        </div>
      ) : null}

      {canOpen ? (
        <div className="mt-1 pb-2">
          <div className="surface-card p-3">
            <Button
              onClick={() => {
                openTelegramLink(material.telegramUrl);
              }}
            >
              {openLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
