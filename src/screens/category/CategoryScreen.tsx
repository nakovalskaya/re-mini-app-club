import { useParams } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";

export function CategoryScreen() {
  const { slug } = useParams();

  return (
    <section className="space-y-6">
      <SectionTitle title={`Категория: ${slug ?? "—"}`} />
      <EmptyState
        title="Экран категории подключен"
        description="На следующем шаге сюда сядут карточки материалов, фильтр тем и связка с mock data."
      />
    </section>
  );
}
