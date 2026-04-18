import { useMemo } from "react";
import { ChallengeCard } from "@/components/ChallengeCard/ChallengeCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getChallengeById, getChallenges } from "@/features/challenges/selectors";
import { Link } from "react-router-dom";

export function ChallengesScreen() {
  const {
    activeChallengeId,
    challengesHydrated,
    getAggregateChallengeProgress,
    getCompletedCount,
    isChallengeActive,
    isChallengeCompleted,
    takeChallenge,
    takenChallengeIds
  } = useAppState();
  const challenges = getChallenges();
  const personalChallenges = useMemo(
    () =>
      takenChallengeIds
        .map((challengeId) => getChallengeById(challengeId))
        .filter(Boolean),
    [takenChallengeIds]
  );
  const challengeDayCounts = useMemo(
    () =>
      challenges.reduce<Record<string, number>>((acc, challenge) => {
        acc[challenge.id] = challenge.durationDays;
        return acc;
      }, {}),
    [challenges]
  );
  const aggregate = getAggregateChallengeProgress(challengeDayCounts);
  const activeChallenge = useMemo(
    () => (activeChallengeId ? getChallengeById(activeChallengeId) : null),
    [activeChallengeId]
  );

  return (
    <section className="screen-stack">
      <SectionTitle
        title="Челленджи"
        eyebrow="Личное"
        description="Здесь живут только взятые и уже пройденные челленджи с общим прогрессом."
      />

      {!challengesHydrated ? (
        <EmptyState
          title="Загружаем челленджи"
          description="Подтягиваем твой активный маршрут и прогресс."
        />
      ) : personalChallenges.length === 0 ? (
        <EmptyState
          title="Пока нет взятых челленджей"
          description="Открой раздел «Марафоны» и возьми первый челлендж — после этого он появится здесь."
        />
      ) : (
        <>
          {personalChallenges.length > 1 ? (
            <div className="surface-card space-y-4 p-card">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">
                  Общий прогресс
                </p>
                <h2 className="font-serif text-[1.9rem] leading-none text-text-primary">
                  Все взятые челленджи
                </h2>
              </div>
              <ProgressBar value={aggregate.completed} max={aggregate.total || 1} />
            </div>
          ) : null}

          {activeChallenge ? (
            <div className="surface-card-elevated space-y-5 bg-accent-deep p-card text-bg-base">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-accent-gold">
                  Текущий активный
                </p>
                <h2 className="font-serif text-[2rem] leading-none">
                  {activeChallenge.title}
                </h2>
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
                Открыть
              </Link>
            </div>
          ) : null}

          <div className="space-y-4">
            {personalChallenges
              .filter((challenge) => challenge!.id !== activeChallengeId)
              .map((challenge) => (
              <ChallengeCard
                key={challenge!.id}
                challenge={challenge!}
                completedDays={getCompletedCount(challenge!.id)}
                status={
                  isChallengeActive(challenge!.id)
                    ? "active"
                    : isChallengeCompleted(challenge!.id, challenge!.durationDays)
                      ? "completed"
                      : "taken"
                }
                onTakeChallenge={takeChallenge}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
