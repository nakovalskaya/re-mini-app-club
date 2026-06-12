import { useChallenges } from "@/app/providers/ChallengesProvider";
import { BackButton } from "@/components/BackButton/BackButton";
import { ChallengeCard } from "@/components/ChallengeCard/ChallengeCard";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getChallenges } from "@/features/challenges/selectors";

export function ChallengeCatalogScreen() {
  const {
    getCompletedCount,
    isChallengeActive,
    isChallengeCompleted,
    isChallengeFinishedEarly,
    isChallengeTaken,
    takeChallenge
  } = useAppState();
  const { challenges, isLoading } = useChallenges();
  const visibleChallenges = getChallenges(challenges);

  if (isLoading) {
    return (
      <section className="screen-stack">
        <BackButton />
        <SectionTitle
          title="Все челленджи"
          eyebrow="Каталог"
          description="Подтягиваем каталог движух."
        />
        <LoadingScreen />
      </section>
    );
  }

  return (
    <section className="screen-stack">
      <BackButton />
      <SectionTitle
        title="Все челленджи"
        eyebrow="Каталог"
        description="Открой весь список маршрутов и выбери практику под текущую задачу."
      />

      <div className="space-y-4">
        {visibleChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            completedDays={getCompletedCount(challenge.id)}
            status={
              isChallengeActive(challenge.id)
                ? "active"
                : isChallengeCompleted(challenge.id)
                  ? "completed"
                  : isChallengeFinishedEarly(challenge.id) || isChallengeTaken(challenge.id)
                    ? "taken"
                    : "default"
            }
            onTakeChallenge={takeChallenge}
          />
        ))}
      </div>
    </section>
  );
}
