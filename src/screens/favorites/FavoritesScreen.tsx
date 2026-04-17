import { EmptyState } from "@/components/EmptyState/EmptyState";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";

export function FavoritesScreen() {
  return (
    <section className="space-y-6">
      <SectionTitle title="Избранное" />
      <EmptyState
        title="Пока пусто"
        description="CloudStorage abstraction уже подготовлен. На следующем шаге сюда подключим сохраненные материалы."
      />
    </section>
  );
}
