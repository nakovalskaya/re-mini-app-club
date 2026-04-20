import { useMaterials } from "@/app/providers/MaterialsProvider";
import { useParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton/BackButton";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { getMaterialsByDate } from "@/features/materials/selectors";

export function CalendarDayScreen() {
  const { materials, isLoading } = useMaterials();
  const { date } = useParams();
  const dayMaterials = date ? getMaterialsByDate(materials, date) : [];

  if (isLoading) {
    return (
      <section className="screen-stack">
        <BackButton />
        <SectionTitle
          title={date ?? "Дата"}
          eyebrow="Материалы дня"
          description="Подтягиваем материалы из Notion для этой даты."
        />
        <EmptyState
          title="Загружаем материалы"
          description="Календарь обновится сразу после загрузки публикаций."
        />
      </section>
    );
  }

  return (
    <section className="screen-stack">
      <BackButton />
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
