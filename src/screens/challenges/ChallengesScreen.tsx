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
    resetAllChallenges,
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

      {import.meta.env.DEV ? (
        <div className="surface-card flex items-center justify-between gap-4 p-4">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
              dev tools
            </p>
            <p className="text-sm text-text-secondary">
              Сбросить состояние челленджей для повторного тестирования маршрутов.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-auto shrink-0 px-4"
            onClick={resetAllChallenges}
          >
            Сбросить прогресс челленджей
          </Button>
        </div>
      ) : null}

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
