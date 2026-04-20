import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LockSimple } from "@phosphor-icons/react";
import { Button } from "@/components/Button/Button";
import { BackButton } from "@/components/BackButton/BackButton";
import { ChallengeDayCard } from "@/components/ChallengeDayCard/ChallengeDayCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getChallengeById } from "@/features/challenges/selectors";

export function ChallengeDetailsScreen() {
  const { id } = useParams();
  const {
    activeChallengeId,
    toggleChallengeDay,
    getCompletedCount,
    completedDayIdsByChallenge,
    isChallengeTaken,
    isChallengeCompleted,
    isChallengeFinishedEarly,
    takeChallenge,
    toggleSkipChallengeDay,
    finishActiveChallenge,
    completeChallenge,
    skippedDayIdsByChallenge
  } = useAppState();
  const challenge = id ? getChallengeById(id) : null;
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [showFinishOverlay, setShowFinishOverlay] = useState(false);

  useEffect(() => {
    if (challenge?.days[0]) {
      setSelectedDayId(challenge.days[0].id);
    }
  }, [challenge]);

  const isTaken = challenge ? isChallengeTaken(challenge.id) : false;
  const completedDayIds = challenge ? completedDayIdsByChallenge[challenge.id] ?? [] : [];
  const skippedDayIds = challenge ? skippedDayIdsByChallenge[challenge.id] ?? [] : [];
  const completedCount = challenge ? getCompletedCount(challenge.id) : 0;
  const closedDayIds = useMemo(
    () => new Set([...completedDayIds, ...skippedDayIds]),
    [completedDayIds, skippedDayIds]
  );
  const isChallengeDone = challenge ? isChallengeCompleted(challenge.id) : false;
  const isChallengeFinished = challenge ? isChallengeFinishedEarly(challenge.id) : false;
  const isReadOnly = isChallengeDone || isChallengeFinished;

  const selectedDay = useMemo(
    () => challenge?.days.find((day) => day.id === selectedDayId) ?? challenge?.days[0] ?? null,
    [challenge, selectedDayId]
  );

  if (!challenge) {
    return (
      <section className="screen-stack">
        <EmptyState
          title="Челлендж не найден"
          description="Похоже, такой маршрут пока не добавлен."
        />
      </section>
    );
  }

  const getDayStatus = (dayNumber: number, dayId: string) => {
    if (completedDayIds.includes(dayId)) {
      return "completed" as const;
    }
    if (skippedDayIds.includes(dayId)) {
      return "skipped" as const;
    }

    if (!isTaken) {
      return dayNumber <= 3 ? ("preview" as const) : ("locked" as const);
    }
    if (isReadOnly) {
      return "available" as const;
    }

    const firstOpenDay = challenge.days.find((day) => !closedDayIds.has(day.id));
    if (firstOpenDay?.id === dayId) {
      return "current" as const;
    }

    return "locked" as const;
  };

  const handleCloseFinalOpenDay = (dayId: string) => {
    if (isReadOnly || closedDayIds.has(dayId)) {
      return;
    }

    const nextClosedCount = closedDayIds.size + 1;
    if (nextClosedCount < challenge.durationDays) {
      return;
    }

    window.setTimeout(() => {
      setShowCompletionOverlay(true);
    }, 50);
  };

  return (
    <section className="screen-stack">
      <BackButton />
      <SectionTitle
        title={challenge.title}
        eyebrow="Челлендж"
        description={challenge.description}
      />

      <div className="surface-card-elevated space-y-4 p-[1.05rem]">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-text-secondary">
              {challenge.durationDays} дней · сложность {challenge.difficulty}/5
            </p>
            <span className="rounded-full border border-border-soft bg-bg-soft px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-text-secondary">
              {completedCount} / {challenge.durationDays}
            </span>
          </div>
          <div className="max-w-[13rem]">
            <ProgressBar value={completedCount} max={challenge.durationDays} />
          </div>
        </div>

        {isReadOnly ? (
          <div className="rounded-[24px] border border-border-medium bg-bg-soft px-4 py-3 text-sm leading-6 text-text-secondary">
            {isChallengeDone
              ? "Маршрут пройден целиком. Дни и статусы сохранены, но редактирование уже закрыто."
              : "Челлендж завершён. Если хочешь пройти новый маршрут, вернись в раздел челленджей."}
          </div>
        ) : null}

        <div className="rounded-[22px] border border-border-soft bg-[var(--color-surface-muted)] p-3">
          <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-6">
          {challenge.days.map((day) => {
            const status = getDayStatus(day.dayNumber, day.id);
            const isSelected = selectedDay?.id === day.id;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => {
                  if (status !== "locked" || isReadOnly) {
                    setSelectedDayId(day.id);
                  }
                }}
                className={`pressable flex h-[3.2rem] w-full max-w-[3.2rem] items-center justify-center justify-self-center rounded-full border text-[13px] font-semibold ${
                  status === "completed"
                    ? "status-chip-completed"
                    : status === "current"
                      ? "border-accent-deep bg-accent-deep text-bg-base"
                      : status === "skipped"
                        ? "status-chip-skipped"
                        : status === "preview"
                          ? "border-border-medium bg-bg-soft text-text-primary"
                          : "border-border-soft bg-bg-surface text-text-secondary"
                } ${isSelected ? "ring-1 ring-accent-gold/60" : ""}`}
                disabled={status === "locked" && !isReadOnly}
              >
                {status === "locked" ? (
                  <LockSimple size={15} weight="regular" color="#5d0806" />
                ) : (
                  day.dayNumber
                )}
              </button>
            );
          })}
          </div>
        </div>

        {!isTaken ? (
          <div className="flex justify-start pt-0.5">
            <Button
              className="min-h-10 w-full rounded-[16px] px-4 py-2 text-[12px] sm:w-auto sm:min-w-[10rem]"
              onClick={() => takeChallenge(challenge.id)}
            >
              Начать
            </Button>
          </div>
        ) : null}
      </div>

      {selectedDay ? (
        <ChallengeDayCard
          day={selectedDay}
          status={getDayStatus(selectedDay.dayNumber, selectedDay.id)}
          readOnly={isReadOnly}
          readOnlyLabel={isChallengeDone ? "маршрут закрыт" : isChallengeFinished ? "завершен" : null}
          onComplete={(dayId) => {
            toggleChallengeDay(challenge.id, dayId);
            handleCloseFinalOpenDay(dayId);
          }}
          onSkip={(dayId) => {
            toggleSkipChallengeDay(challenge.id, dayId);
            handleCloseFinalOpenDay(dayId);
          }}
        />
      ) : (
        <EmptyState
          title="День пока не выбран"
          description="Выбери день из верхней сетки, чтобы посмотреть задание."
        />
      )}

      {activeChallengeId === challenge.id && (
        <div className="mt-8 border-t border-border-soft pt-4">
          <Button variant="secondary" onClick={() => setShowFinishOverlay(true)}>
            Завершить челлендж
          </Button>
        </div>
      )}

      {showCompletionOverlay ? (
        <div className="overlay-scrim fixed inset-0 z-40 flex items-center justify-center px-4 py-6">
          <div className="surface-card w-full max-w-[21.5rem] space-y-4 rounded-[22px] p-5 font-montserrat shadow-floating">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Челлендж завершён
              </p>
              <h3 className="font-montserrat text-[1.5rem] font-semibold leading-[1.02] text-text-primary">
                Поздравляю, ты прошёл челлендж
              </h3>
              <p className="text-[13px] leading-5 text-text-secondary">
                Отдохни и приступай к следующему 😻
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="min-h-11 font-montserrat text-[13px]"
                onClick={() => setShowCompletionOverlay(false)}
              >
                Назад
              </Button>
              <Button
                className="min-h-11 font-montserrat text-[13px]"
                onClick={() => {
                  completeChallenge(challenge.id);
                  setShowCompletionOverlay(false);
                }}
              >
                Хорошо
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showFinishOverlay ? (
        <div className="overlay-scrim fixed inset-0 z-40 flex items-center justify-center px-4 py-6">
          <div className="surface-card w-full max-w-[21.5rem] space-y-4 rounded-[22px] p-5 font-montserrat shadow-floating">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Подтверждение
              </p>
              <h3 className="font-montserrat text-[1.5rem] font-semibold leading-[1.02] text-text-primary">
                Завершить челлендж досрочно?
              </h3>
              <p className="text-[13px] leading-5 text-text-secondary">
                Челлендж завершён. Если хочешь пройти новый маршрут, вернись в раздел челленджей.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="min-h-11 font-montserrat text-[13px]"
                onClick={() => setShowFinishOverlay(false)}
              >
                Назад
              </Button>
              <Button
                className="min-h-11 font-montserrat text-[13px]"
                onClick={() => {
                  finishActiveChallenge();
                  setShowFinishOverlay(false);
                }}
              >
                Хорошо
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
