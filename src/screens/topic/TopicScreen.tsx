import { useParams } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";

export function TopicScreen() {
  const { slug } = useParams();

  return (
    <section className="space-y-6">
      <SectionTitle title={`Тема: ${slug ?? "—"}`} />
      <EmptyState
        title="Экран темы подключен"
        description="Дальше сюда добавим заголовок темы, смешанный список материалов и фильтр по типу."
      />
    </section>
  );
}
