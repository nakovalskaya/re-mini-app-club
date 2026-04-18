import { useParams } from "react-router-dom";
import { ChallengeCard } from "@/components/ChallengeCard/ChallengeCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getChallenges } from "@/features/challenges/selectors";
import { getCategoryBySlug, getMaterialsByCategorySlug } from "@/features/materials/selectors";

export function CategoryScreen() {
  const { slug } = useParams();
  const category = slug ? getCategoryBySlug(slug) : null;
  const categoryMaterials = slug ? getMaterialsByCategorySlug(slug) : [];
  const { activeChallengeId, getCompletedCount, isChallengeTaken, isChallengeCompleted, takeChallenge } =
    useAppState();
  const challenges = getChallenges();

  const activeChallenge = activeChallengeId ? challenges.find(c => c.id === activeChallengeId) : null;
  const isAnyActive = activeChallenge ? (!isChallengeCompleted(activeChallenge.id, activeChallenge.durationDays)) : false;

  if (!category) {
    return (
      <section className="screen-stack">
        <EmptyState
          title="Категория не найдена"
          description="Похоже, такой категории пока нет в mock data."
        />
      </section>
    );
  }

  return (
    <section className="screen-stack">
      <SectionTitle
        title={category.slug === "marathon" ? "Марафоны" : category.title}
        eyebrow="Категория"
        description={category.description}
      />
      {category.slug === "marathon" ? (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              completedDays={getCompletedCount(challenge.id)}
              status={
                isChallengeCompleted(challenge.id, challenge.durationDays)
                  ? "completed"
                  : isChallengeTaken(challenge.id)
                    ? "taken"
                    : "default"
              }
              onTakeChallenge={takeChallenge}
            />
          ))}
        </div>
      ) : categoryMaterials.length === 0 ? (
        <EmptyState
          title="Пока пусто"
          description="Для этой категории еще не добавлены материалы."
        />
      ) : (
        <div className="space-y-4">
          {categoryMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </section>
  );
}
