import { useLinks } from "@/app/providers/LinksProvider";
import { useMaterials } from "@/app/providers/MaterialsProvider";
import { useParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton/BackButton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { LinkCard } from "@/components/LinkCard/LinkCard";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { getMaterialsByTopicSlug, getTopicBySlug } from "@/features/materials/selectors";

const usefulLinksTopicId = "topic-useful-links";

export function TopicScreen() {
  const { links, isLoading: linksLoading } = useLinks();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { slug } = useParams();
  const topic = slug ? getTopicBySlug(slug) : null;
  const topicMaterials = slug ? getMaterialsByTopicSlug(materials, slug) : [];
  const isUsefulLinksTopic = topic?.id === usefulLinksTopicId;
  const isLoading = isUsefulLinksTopic ? linksLoading : materialsLoading;
  const description = isUsefulLinksTopic
    ? "Собрала быстрые входы в важные сервисы, документы и дополнительные материалы."
    : "Собранные материалы из разных категорий по одному смысловому направлению.";

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
          description={description}
        />
        <LoadingScreen caption={isUsefulLinksTopic ? "Загружаем ссылки" : "Загружаем материалы"} />
      </section>
    );
  }

  return (
    <section className="screen-stack">
      <BackButton />
      <SectionTitle
        title={topic.title}
        eyebrow="Тема"
        description={description}
      />
      {isUsefulLinksTopic ? (
        links.length === 0 ? (
          <EmptyState
            title="Пока пусто"
            description="Добавь опубликованные ссылки в базу Notion, и они появятся здесь."
          />
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        )
      ) : topicMaterials.length === 0 ? (
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
