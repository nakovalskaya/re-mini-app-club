import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton/BackButton";
import { Button } from "@/components/Button/Button";
import { FavoriteButton } from "@/components/FavoriteButton/FavoriteButton";
import { TopicPill } from "@/components/TopicPill/TopicPill";
import { openTelegramLink } from "@/features/telegram/telegram";
import { getMaterialById } from "@/features/materials/selectors";
import { topics } from "@/data/topics";
import { EmptyState } from "@/components/EmptyState/EmptyState";

export function MaterialScreen() {
  const { id } = useParams();
  const material = id ? getMaterialById(id) : null;

  if (!material) {
    return (
      <section className="screen-stack">
        <EmptyState
          title="Материал не найден"
          description="Похоже, этот материал ещё не добавлен в mock data."
        />
      </section>
    );
  }

  const materialTopics = topics.filter((topic) => material.topicIds.includes(topic.id));
  const hasTelegramUrl = Boolean(material.telegramUrl);
  const openLabel = hasTelegramUrl ? "Смотреть" : "Контент скоро появится";
  const typeLabel = useMemo(() => {
    const labels: Record<string, string> = {
      lesson: "lesson",
      live: "live",
      podcast: "podcast",
      guide: "guide",
      article: "article"
    };

    return labels[material.type] ?? material.type;
  }, [material.type]);
  const meta = [typeLabel, material.duration].filter(Boolean).join(" · ");

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
        <div className="relative">
          <img
            src={material.coverImage}
            alt={material.title}
            className="h-64 w-full object-cover"
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
        <div className="rounded-[24px] border border-border-soft bg-[rgba(255,248,247,0.94)] p-3 shadow-soft backdrop-blur">
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
