import { useMaterials } from "@/app/providers/MaterialsProvider";
import { useParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton/BackButton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { getMaterialsByTopicSlug, getTopicBySlug } from "@/features/materials/selectors";

export function TopicScreen() {
  const { materials, isLoading } = useMaterials();
  const { slug } = useParams();
  const topic = slug ? getTopicBySlug(slug) : null;
  const topicMaterials = slug ? getMaterialsByTopicSlug(materials, slug) : [];

  if (!topic) {
    return (
      <section className="screen-stack">
        <EmptyState
          title="Тема не найдена"
          description="Похоже, такой темы нет в текущей структуре приложения."
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="screen-stack">
        <BackButton />
        <SectionTitle
          title={topic.title}
          eyebrow="Тема"
          description="Собранные материалы из разных категорий по одному смысловому направлению."
        />
        <EmptyState
          title="Загружаем материалы"
          description="Подтягиваем опубликованные записи из Notion."
        />
      </section>
    );
  }

  return (
    <section className="screen-stack">
      <BackButton />
      <SectionTitle
        title={topic.title}
        eyebrow="Тема"
        description="Собранные материалы из разных категорий по одному смысловому направлению."
      />
      {topicMaterials.length === 0 ? (
        <EmptyState
          title="Пока пусто"
          description="По этой теме материалы еще не собраны."
        />
      ) : (
        <div className="space-y-4">
          {topicMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </section>
  );
}
