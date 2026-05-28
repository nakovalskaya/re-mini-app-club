import { useMemo } from "react";
import { useChallenges } from "@/app/providers/ChallengesProvider";
import { Button } from "@/components/Button/Button";
import { ChallengeCard } from "@/components/ChallengeCard/ChallengeCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
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
  const { challenges, isLoading } = useChallenges();
  const navigate = useNavigate();
  const personalChallenges = useMemo(
    () =>
      takenChallengeIds
        .map((challengeId) => getChallengeById(challenges, challengeId))
        .filter(Boolean),
    [challenges, takenChallengeIds]
  );
  const activeChallenge = useMemo(
    () => (activeChallengeId ? getChallengeById(challenges, activeChallengeId) : null),
    [activeChallengeId, challenges]
  );

  return (
    <section className="screen-stack pt-2">
      <SectionTitle
        title="Челленджи"
        description="Каталог челленджей и твой личный прогресс"
      />

      <Link
        to={ROUTE_CHALLENGE_CATALOG}
        className="surface-card pressable block space-y-3 p-card"
      >
        <p className="type-page-eyebrow">
          Каталог
        </p>
        <div className="space-y-2">
          <h2 className="type-page-title font-serif text-text-primary">
            Все движухи
          </h2>
          <p className="type-page-description">
            Открой каталог и выбери маршрут
          </p>
        </div>
      </Link>

      {!challengesHydrated || isLoading ? (
        <LoadingScreen caption="Загружаем челленджи" />
      ) : personalChallenges.length === 0 ? (
        <EmptyState
          title="Ты пока не проходил челленджи"
          description="Открой каталог движух и возьми первый маршрут, после этого он появится здесь"
          actionLabel="Открыть каталог"
          onAction={() => navigate(ROUTE_CHALLENGE_CATALOG)}
        />
      ) : (
        <>
          {activeChallenge ? (
            <div className="surface-card-elevated space-y-4 p-card text-bg-base">
              <div className="space-y-1.5">
                <p className="type-page-eyebrow text-[#ffe7bb]">
                  Активный
                </p>
                <h2 className="type-page-title font-serif">
                  {activeChallenge.title}
                </h2>
                <p className="type-body text-[rgba(255,246,247,0.82)]">
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
