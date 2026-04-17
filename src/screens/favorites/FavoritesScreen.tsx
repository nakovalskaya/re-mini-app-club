import { EmptyState } from "@/components/EmptyState/EmptyState";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { materials } from "@/data/materials";

export function FavoritesScreen() {
  const { favoriteIds } = useAppState();
  const favoriteMaterials = materials.filter((material) => favoriteIds.includes(material.id));

  return (
    <section className="screen-stack">
      <SectionTitle
        title="Избранное"
        eyebrow="Личное"
        description="Сохраняй важные материалы звездой и возвращайся к ним в один тап."
      />
      {favoriteMaterials.length === 0 ? (
        <EmptyState
          title="Пока ничего не сохранено"
          description="Нажми на звезду в карточке материала, и он появится здесь."
        />
      ) : (
        <div className="space-y-4">
          {favoriteMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </section>
  );
}
