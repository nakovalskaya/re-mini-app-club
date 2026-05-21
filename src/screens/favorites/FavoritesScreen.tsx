import { useMaterials } from "@/app/providers/MaterialsProvider";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";

export function FavoritesScreen() {
  const { materials, isLoading } = useMaterials();
  const { favoriteIds, favoritesHydrated } = useAppState();
  const favoriteMaterials = favoriteIds
    .map((favoriteId) => materials.find((material) => material.id === favoriteId))
    .filter((material): material is (typeof materials)[number] => Boolean(material));

  return (
    <section className="screen-stack pt-2">
      <SectionTitle
        title="Избранное"
        description="Сохраняй важные материалы звездой и возвращайся к ним в один тап."
      />
      {!favoritesHydrated || isLoading ? (
        <LoadingScreen caption="Загружаем избранное" />
      ) : favoriteMaterials.length === 0 ? (
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
