import { useMemo } from "react";
import { ChallengeCard } from "@/components/ChallengeCard/ChallengeCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getChallengeById, getChallenges } from "@/features/challenges/selectors";
import { Link } from "react-router-dom";
import { Button } from "@/components/Button/Button";

export function ChallengesScreen() {
  const {
    activeChallengeId,
    challengesHydrated,
    getCompletedCount,
    isChallengeActive,
    takeChallenge
  } = useAppState();
  const challenges = getChallenges();
  const activeChallenge = useMemo(
    () => (activeChallengeId ? getChallengeById(activeChallengeId) : null),
    [activeChallengeId]
  );

  return (
    <section className="screen-stack">
      <SectionTitle
        title="Челленджи"
        eyebrow="Практика"
        description="Выбирай один активный маршрут и проходи задания по дням в спокойном ритме."
      />

      {!challengesHydrated ? (
        <EmptyState
          title="Загружаем челленджи"
          description="Подтягиваем твой активный маршрут и прогресс."
        />
      ) : activeChallenge ? (
        <div className="surface-card-elevated space-y-5 bg-accent-deep p-card text-bg-base">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-accent-gold">
              Твой активный челлендж
            </p>
            <h2 className="font-serif text-[2rem] leading-none">{activeChallenge.title}</h2>
            <p className="text-sm leading-6 text-[#f7e8e3]">
              {activeChallenge.description}
            </p>
          </div>
          <ProgressBar
            value={getCompletedCount(activeChallenge.id)}
            max={activeChallenge.durationDays}
          />
          <Link
            to={`/challenges/${activeChallenge.id}`}
            className="pressable inline-flex min-h-12 items-center justify-center rounded-button bg-[rgba(255,248,247,0.92)] px-5 py-3 text-sm font-semibold text-accent-deep"
          >
            Продолжить
          </Link>
        </div>
      ) : (
        <EmptyState
          title="Пока нет активного челленджа"
          description="Выбери маршрут ниже — после этого он появится в твоей личной зоне."
        />
      )}

      <div className="space-y-4">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            completedDays={getCompletedCount(challenge.id)}
            isActive={isChallengeActive(challenge.id)}
            onTakeChallenge={takeChallenge}
          />
        ))}
      </div>
    </section>
  );
}
