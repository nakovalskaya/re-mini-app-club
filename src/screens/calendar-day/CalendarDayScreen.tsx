import { useParams } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";

export function CalendarDayScreen() {
  const { date } = useParams();

  return (
    <section className="space-y-6">
      <SectionTitle title={`Материалы дня: ${date ?? "—"}`} />
      <EmptyState
        title="Экран дня календаря подключен"
        description="Позже здесь будет список материалов выбранной даты и легенда типов."
      />
    </section>
  );
}
