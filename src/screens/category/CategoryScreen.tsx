import { useMaterials } from "@/app/providers/MaterialsProvider";
import { useParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton/BackButton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { getCategoryBySlug, getMaterialsByCategorySlug } from "@/features/materials/selectors";

export function CategoryScreen() {
  const { materials, isLoading } = useMaterials();
  const { slug } = useParams();
  const category = slug ? getCategoryBySlug(slug) : null;
  const categoryMaterials = slug ? getMaterialsByCategorySlug(materials, slug) : [];

  if (!category) {
    return (
      <section className="screen-stack">
        <EmptyState
          title="Категория не найдена"
          description="Похоже, такой категории нет в текущей структуре приложения."
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="screen-stack">
        <BackButton />
        <SectionTitle
          title={category.title}
          eyebrow="Категория"
          description={category.description}
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
        title={category.title}
        eyebrow="Категория"
        description={category.description}
      />
      {categoryMaterials.length === 0 ? (
        <EmptyState
          title="Пока пусто"
          description="Для этой категории еще не добавлены материалы."
        />
      ) : (
        <div className="space-y-4">
          {categoryMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </section>
  );
}
