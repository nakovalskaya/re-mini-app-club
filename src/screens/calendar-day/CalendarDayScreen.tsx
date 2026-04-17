import { useParams } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { getMaterialsByDate } from "@/features/materials/selectors";

export function CalendarDayScreen() {
  const { date } = useParams();
  const dayMaterials = date ? getMaterialsByDate(date) : [];

  return (
    <section className="screen-stack">
      <SectionTitle
        title={date ?? "Дата"}
        eyebrow="Материалы дня"
        description={
          dayMaterials.length > 0
            ? `На эту дату собрано материалов: ${dayMaterials.length}.`
            : "На эту дату пока нет материалов."
        }
      />
      {dayMaterials.length === 0 ? (
        <EmptyState
          title="Пустой день"
          description="Для этой даты пока нет материалов в календаре."
        />
      ) : (
        <div className="space-y-4">
          {dayMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </section>
  );
}
