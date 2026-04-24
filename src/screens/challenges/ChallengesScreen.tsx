import { useMemo } from "react";
import { Button } from "@/components/Button/Button";
import { ChallengeCard } from "@/components/ChallengeCard/ChallengeCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getChallengeById } from "@/features/challenges/selectors";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_CHALLENGE_CATALOG } from "@/shared/constants/routes";

export function ChallengesScreen() {
  const {
    activeChallengeId,
    challengesHydrated,
    getCompletedCount,
    isChallengeActive,
    isChallengeCompleted,
    isChallengeFinishedEarly,
    takeChallenge,
    takenChallengeIds
  } = useAppState();
  const navigate = useNavigate();
  const personalChallenges = useMemo(
    () =>
      takenChallengeIds
        .map((challengeId) => getChallengeById(challengeId))
        .filter(Boolean),
    [takenChallengeIds]
  );
  const activeChallenge = useMemo(
    () => (activeChallengeId ? getChallengeById(activeChallengeId) : null),
    [activeChallengeId]
  );

  return (
    <section className="screen-stack">
      <SectionTitle
        title="Челленджи"
        eyebrow="Личное"
        description="Здесь живут только твои маршруты: активные, взятые и уже завершённые."
      />

      <Link
        to={ROUTE_CHALLENGE_CATALOG}
        className="surface-card pressable block space-y-3 p-card"
      >
        <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">
          Каталог
        </p>
        <div className="space-y-2">
          <h2 className="font-serif text-[1.72rem] leading-[0.98] text-text-primary">
            Все движухи
          </h2>
          <p className="max-w-[30ch] text-[13px] leading-5 text-text-secondary">
            Открой каталог и выбери маршрут под себя
          </p>
        </div>
      </Link>

      {!challengesHydrated ? (
        <EmptyState
          title="Загружаем челленджи"
          description="Подтягиваем твой активный маршрут и прогресс."
        />
      ) : personalChallenges.length === 0 ? (
        <EmptyState
          title="Пока нет взятых челленджей"
          description="Открой каталог движух и возьми первый маршрут — после этого он появится здесь."
          actionLabel="Открыть каталог"
          onAction={() => navigate(ROUTE_CHALLENGE_CATALOG)}
        />
      ) : (
        <>
          {activeChallenge ? (
            <div className="surface-card-elevated space-y-4 bg-accent-deep p-card text-bg-base">
              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#ffe7bb]">
                  Активный
                </p>
                <h2 className="font-serif text-[1.88rem] leading-[0.95] text-[#fff6f7]">
                  {activeChallenge.title}
                </h2>
                <p className="text-sm leading-6 text-[rgba(255,246,247,0.82)]">
                  {activeChallenge.description}
                </p>
              </div>
              <ProgressBar
                value={getCompletedCount(activeChallenge.id)}
                max={activeChallenge.durationDays}
              />
              <div className="flex justify-end">
                <Link
                  to={`/challenges/${activeChallenge.id}`}
                  className="button-secondary-compact pressable inline-flex min-h-11 items-center justify-center rounded-button px-4 py-2.5 text-[13px] font-semibold leading-none"
                >
                  Открыть
                </Link>
              </div>
            </div>
          ) : null}

          <div className="space-y-3.5">
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
                    : isChallengeCompleted(challenge!.id)
                      ? "completed"
                      : isChallengeFinishedEarly(challenge!.id)
                        ? "taken"
                        : "default"
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
