import { useParams } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";

export function ChallengeDetailsScreen() {
  const { id } = useParams();

  return (
    <section className="space-y-6">
      <SectionTitle title={`Челлендж: ${id ?? "—"}`} />
      <div className="surface-card space-y-4 p-card">
        <p className="text-sm text-text-secondary">Пример состояния progress bar</p>
        <ProgressBar value={3} max={7} />
      </div>
      <EmptyState
        title="Экран челленджа подключен"
        description="Дальше сюда сядут hero челленджа, список дней и действия пользователя."
      />
    </section>
  );
}
