import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMaterials } from "@/app/providers/MaterialsProvider";
import { BackButton } from "@/components/BackButton/BackButton";
import { Button } from "@/components/Button/Button";
import { FavoriteButton } from "@/components/FavoriteButton/FavoriteButton";
import { TopicPill } from "@/components/TopicPill/TopicPill";
import { openTelegramLink } from "@/features/telegram/telegram";
import { getMaterialById } from "@/features/materials/selectors";
import { topics } from "@/data/topics";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { getImageSrcSet, getOptimizedImageUrl } from "@/shared/utils/images";
import { cn } from "@/shared/utils/cn";

export function MaterialScreen() {
  const { materials, isLoading } = useMaterials();
  const { id } = useParams();
  const material = id ? getMaterialById(materials, id) : null;

  if (isLoading) {
    return (
      <section className="screen-stack">
        <EmptyState
          title="Загружаем материал"
          description="Подключаем публикации из Notion."
        />
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
  const hasTelegramUrl = Boolean(material.telegramUrl);
  const openLabel = "Открыть материал";
  const isScheduled = material.status === "scheduled";
  const isTextMaterial = material.type === "guide" || material.type === "article";
  const typeLabel = useMemo(() => {
    const labels: Record<string, string> = {
      lesson: "Урок",
      live: "Эфир",
      podcast: "Подкаст",
      guide: "Гайд",
      article: "Статья"
    };

    return labels[material.type] ?? material.type;
  }, [material.type]);
  const metaItems = [typeLabel, isScheduled ? "Скоро" : "", !isTextMaterial ? material.duration : ""].filter(
    Boolean
  );
  const detailImageSrc = getOptimizedImageUrl(material.coverImage, {
    width: 720,
    quality: 66
  });
  const detailImageSrcSet = getImageSrcSet(material.coverImage, [320, 480, 720], 66);

  return (
    <section className="screen-stack pb-10">
      <div className="flex items-center justify-between">
        <BackButton />
        <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
          Материал
        </p>
        <div className="w-11" />
      </div>

      <article
        role={hasTelegramUrl ? "button" : undefined}
        tabIndex={hasTelegramUrl ? 0 : undefined}
        onClick={() => {
          if (hasTelegramUrl) {
            openTelegramLink(material.telegramUrl);
          }
        }}
        onKeyDown={(event) => {
          if (!hasTelegramUrl) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openTelegramLink(material.telegramUrl);
          }
        }}
        className={cn("surface-card overflow-hidden", hasTelegramUrl && "cursor-pointer")}
      >
        <div className="material-image-frame relative h-44">
          <img
            src={detailImageSrc}
            srcSet={detailImageSrcSet}
            sizes="(max-width: 768px) 100vw, 360px"
            alt={material.title}
            width={1200}
            height={528}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover material-image-eager"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(38,4,4,0.16)] to-transparent" />
          <FavoriteButton materialId={material.id} className="absolute right-4 top-4" />
          {isScheduled ? (
            <div className="absolute bottom-4 left-4 rounded-full bg-[rgba(255,242,220,0.92)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
              Скоро
            </div>
          ) : null}
        </div>
        <div className="space-y-3 p-card">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-secondary">
              {metaItems.map((item, index) => (
                <div key={`${material.id}-detail-meta-${item}-${index}`} className="inline-flex items-center gap-2">
                  {index > 0 ? <span className="h-1 w-1 rounded-full bg-border-medium" /> : null}
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <h1 className="font-serif text-[1.42rem] leading-[0.95] text-text-primary">
              {material.title}
            </h1>
            <p className="text-[13px] leading-5 text-text-secondary">
              {material.longDescription ?? material.shortDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {materialTopics.map((topic) => (
              <TopicPill key={topic.id} label={topic.title} to={`/topic/${topic.slug}`} />
            ))}
          </div>
        </div>
      </article>

      {material.extraDescription ? (
        <div className="surface-card space-y-2 p-card">
          <p className="text-[13px] leading-6 text-text-secondary whitespace-pre-line">
            {material.extraDescription}
          </p>
        </div>
      ) : null}

      {hasTelegramUrl ? (
        <div className="mt-1 pb-2">
          <div className="surface-card p-3">
            <Button
              className={cn(!hasTelegramUrl && "opacity-100")}
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
