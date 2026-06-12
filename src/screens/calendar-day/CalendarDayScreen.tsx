import { useChallenges } from "@/app/providers/ChallengesProvider";
import { useMaterials } from "@/app/providers/MaterialsProvider";
import { useParams } from "react-router-dom";
import { BackButton } from "@/components/BackButton/BackButton";
import { CalendarChallengeDayCard } from "@/components/CalendarChallengeDayCard/CalendarChallengeDayCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { getChallengesByDate, getMaterialsByDate } from "@/features/materials/selectors";

export function CalendarDayScreen() {
  const { materials, isLoading } = useMaterials();
  const { challenges, isLoading: challengesLoading } = useChallenges();
  const { date } = useParams();
  const dayMaterials = date ? getMaterialsByDate(materials, date) : [];
  const dayChallenges = date ? getChallengesByDate(challenges, date) : [];
  const totalItems = dayMaterials.length + dayChallenges.length;

  if (isLoading || challengesLoading) {
    return (
      <section className="screen-stack">
        <BackButton />
        <SectionTitle
          title={date ?? "Дата"}
          eyebrow="Материалы дня"
          description="Подтягиваем материалы и движухи для этой даты."
        />
        <LoadingScreen caption="Загружаем календарь" />
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
          totalItems > 0
            ? `На эту дату запланировано: ${totalItems}.`
            : "На эту дату пока ничего не запланировано."
        }
      />
      {totalItems === 0 ? (
        <EmptyState description="Для этой даты пока нет материалов или движух в календаре." />
      ) : (
        <div className="space-y-4">
          {dayChallenges.map((challenge) => (
            <CalendarChallengeDayCard key={challenge.id} challenge={challenge} />
          ))}
          {dayMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </section>
  );
}
