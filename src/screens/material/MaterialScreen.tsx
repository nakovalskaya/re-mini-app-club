import { useParams } from "react-router-dom";
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

  return (
    <section className="screen-stack">
      <div className="surface-card overflow-hidden">
        <div className="relative">
          <img
            src={material.coverImage}
            alt={material.title}
            className="h-72 w-full object-cover"
          />
          <FavoriteButton materialId={material.id} className="absolute right-4 top-4" />
        </div>
        <div className="space-y-5 p-card">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
              {material.type} · {material.duration}
            </p>
            <h1 className="font-serif text-[2.2rem] leading-none text-text-primary">
              {material.title}
            </h1>
            <p className="text-base leading-7 text-text-secondary">
              {material.longDescription ?? material.shortDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {materialTopics.map((topic) => (
              <TopicPill key={topic.id} label={topic.title} to={`/topic/${topic.slug}`} />
            ))}
          </div>
          <Button onClick={() => openTelegramLink(material.telegramUrl)}>Смотреть</Button>
        </div>
      </div>
    </section>
  );
}
