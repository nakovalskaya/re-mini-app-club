import { useParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton/BackButton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { getCategoryBySlug, getMaterialsByCategorySlug } from "@/features/materials/selectors";

export function CategoryScreen() {
  const { slug } = useParams();
  const category = slug ? getCategoryBySlug(slug) : null;
  const categoryMaterials = slug ? getMaterialsByCategorySlug(slug) : [];

  if (!category) {
    return (
      <section className="screen-stack">
        <EmptyState
          title="Категория не найдена"
          description="Похоже, такой категории пока нет в mock data."
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
