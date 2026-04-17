import { EmptyState } from "@/components/EmptyState/EmptyState";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";

export function ChallengesScreen() {
  return (
    <section className="space-y-6">
      <SectionTitle title="Челленджи" />
      <EmptyState
        title="Раздел челленджей готов к наполнению"
        description="Следующим шагом здесь появятся активный челлендж, список карточек и прогресс."
      />
    </section>
  );
}
