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
  const openLabel = hasTelegramUrl ? "Смотреть" : "Контент скоро появится";
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
  const meta = [typeLabel, !isTextMaterial ? material.duration : ""].filter(Boolean).join(" · ");
  const detailImageSrc = getOptimizedImageUrl(material.coverImage, {
    width: 1080,
    quality: 72
  });
  const detailImageSrcSet = getImageSrcSet(material.coverImage, [640, 960, 1080], 72);

  return (
    <section className="screen-stack pb-10">
      <div className="flex items-center justify-between">
        <BackButton />
        <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
          Материал
        </p>
        <div className="w-11" />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="material-image-frame relative h-64">
          <img
            src={detailImageSrc}
            srcSet={detailImageSrcSet}
            sizes="(max-width: 768px) 100vw, 420px"
            alt={material.title}
            width={1200}
            height={768}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover material-image-eager"
          />
          <FavoriteButton materialId={material.id} className="absolute right-4 top-4" />
        </div>
        <div className="space-y-4 p-card">
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
              {meta}
            </p>
            <h1 className="font-serif text-[1.84rem] leading-[0.95] text-text-primary">
              {material.title}
            </h1>
            <p className="text-[15px] leading-6 text-text-secondary">
              {material.longDescription ?? material.shortDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {materialTopics.map((topic) => (
              <TopicPill key={topic.id} label={topic.title} to={`/topic/${topic.slug}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 pb-2">
        <div className="frost-panel rounded-[24px] border border-border-soft p-3 shadow-soft backdrop-blur">
          <Button
            disabled={!hasTelegramUrl}
            onClick={() => {
              if (hasTelegramUrl) {
                openTelegramLink(material.telegramUrl);
              }
            }}
          >
            {openLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
