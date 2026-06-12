import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LockSimple } from "@phosphor-icons/react";
import { useChallenges } from "@/app/providers/ChallengesProvider";
import { Button } from "@/components/Button/Button";
import { BackButton } from "@/components/BackButton/BackButton";
import { ChallengeDayCard } from "@/components/ChallengeDayCard/ChallengeDayCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getChallengeById } from "@/features/challenges/selectors";
import { openExternalLink } from "@/features/telegram/telegram";

function formatChallengeStartDate(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
  }).format(new Date(`${value}T00:00:00`));
}

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
    requestResetChallengeProgress,
    skippedDayIdsByChallenge
  } = useAppState();
  const { challenges, isLoading } = useChallenges();
  const challenge = id ? getChallengeById(challenges, id) : null;
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
  const hasDays = Boolean(challenge?.days.length);
  const startLabel = formatChallengeStartDate(challenge?.startDate);

  const selectedDay = useMemo(
    () => challenge?.days.find((day) => day.id === selectedDayId) ?? challenge?.days[0] ?? null,
    [challenge, selectedDayId]
  );

  // The "open window" — first 3 not-yet-closed days. The very first is the
  // current day the user can actually mark; the next two are previewable so
  // the user can read ahead and prepare, but their mark buttons stay disabled.
  const openDayIds = useMemo(() => {
    return challenge?.days
      .filter((day) => !closedDayIds.has(day.id))
      .slice(0, 3)
      .map((day) => day.id) ?? [];
  }, [challenge, closedDayIds]);

  if (isLoading) {
    return (
      <section className="screen-stack">
        <BackButton />
        <LoadingScreen caption="Загружаем челлендж" />
      </section>
    );
  }

  if (!challenge) {
    return (
      <section className="screen-stack">
        <BackButton />
        <EmptyState
          title="Челлендж не найден"
          description="Похоже, такой маршрут пока не добавлен."
        />
      </section>
    );
  }

  if (!hasDays) {
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
            <p className="text-sm text-text-secondary">
              {challenge.durationDays} дней · сложность {challenge.difficulty}/5
            </p>
            {startLabel ? (
              <div className="rounded-[24px] border border-border-medium bg-bg-soft px-4 py-3 text-sm leading-6 text-text-primary">
                Старт будет {startLabel}. Пока это анонс: задания появятся здесь, когда ты добавишь дни в Notion.
              </div>
            ) : (
              <div className="rounded-[24px] border border-border-medium bg-bg-soft px-4 py-3 text-sm leading-6 text-text-secondary">
                Челлендж опубликован как анонс, но дата старта пока не указана.
              </div>
            )}
          </div>
        </div>

        <EmptyState
          title="Скоро старт"
          description={
            startLabel
              ? `Старт будет ${startLabel}. Когда появятся задания, здесь откроется маршрут по дням.`
              : "Добавь дату старта и дни челленджа в Notion, чтобы маршрут стал полноценным."
          }
        />

        {challenge.rulesUrl ? (
          <Button
            className="min-h-11"
            onClick={() => openExternalLink(challenge.rulesUrl)}
          >
            Правила челленджа
          </Button>
        ) : null}
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

    const openIndex = openDayIds.indexOf(dayId);
    if (openIndex === 0) {
      return "current" as const;
    }
    if (openIndex > 0) {
      return "preview" as const;
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

  // Advance the highlighted day to the next not-yet-closed day after the one
  // the user just marked. closedDayIds reflects state BEFORE the mutation, so
  // if the day was already closed we skip — that's an un-mark / re-mark
  // correction, not a fresh "I'm done with this day, move on".
  const advanceToNextOpenDay = (justMarkedDayId: string) => {
    if (!challenge || closedDayIds.has(justMarkedDayId)) {
      return;
    }
    const currentIndex = challenge.days.findIndex((d) => d.id === justMarkedDayId);
    if (currentIndex === -1) {
      return;
    }
    const nextOpen = challenge.days
      .slice(currentIndex + 1)
      .find((d) => !closedDayIds.has(d.id));
    if (nextOpen) {
      setSelectedDayId(nextOpen.id);
    }
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
              {closedDayIds.size} / {challenge.durationDays}
            </span>
          </div>
          <div className="max-w-[13rem]">
            <ProgressBar value={closedDayIds.size} max={challenge.durationDays} />
          </div>
        </div>

        {isReadOnly ? (
          <div className="rounded-[24px] border border-border-medium bg-bg-soft px-4 py-3 text-sm leading-6 text-text-secondary">
            {isChallengeDone
              ? "Маршрут пройден целиком. Дни и статусы сохранены, но редактирование уже закрыто."
              : "Челлендж завершён. Если хочешь пройти новый маршрут, вернись в раздел челленджей."}
          </div>
        ) : null}

        <div className="surface-inset rounded-[22px] p-3">
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
                className={`flex h-[3.2rem] w-full max-w-[3.2rem] items-center justify-center justify-self-center rounded-full border text-[13px] font-semibold ${
                  status === "completed"
                    ? "status-accent-completed"
                    : status === "current"
                      ? "status-accent-current"
                      : status === "skipped"
                        ? "status-accent-skipped"
                        : status === "preview"
                          ? "challenge-day-pip"
                          : "challenge-day-pip text-text-secondary"
                } ${isSelected ? "ring-1 ring-accent-gold/60" : ""}`}
                disabled={status === "locked" && !isReadOnly}
              >
                {status === "locked" ? (
                  <LockSimple size={15} weight="regular" color="var(--color-lock-muted)" />
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
        <div key={selectedDay.id} className="challenge-day-fade-in">
          <ChallengeDayCard
            day={selectedDay}
            status={getDayStatus(selectedDay.dayNumber, selectedDay.id)}
            readOnly={isReadOnly}
            readOnlyLabel={isChallengeDone ? "маршрут закрыт" : isChallengeFinished ? "завершен" : null}
            onComplete={(dayId) => {
              toggleChallengeDay(challenge.id, dayId);
              handleCloseFinalOpenDay(dayId);
              advanceToNextOpenDay(dayId);
            }}
            onSkip={(dayId) => {
              toggleSkipChallengeDay(challenge.id, dayId);
              handleCloseFinalOpenDay(dayId);
              advanceToNextOpenDay(dayId);
            }}
          />
        </div>
      ) : (
        <EmptyState
          title="День пока не выбран"
          description="Выбери день из верхней сетки, чтобы посмотреть задание."
        />
      )}

      {challenge.rulesUrl ? (
        <Button
          className="min-h-11"
          onClick={() => openExternalLink(challenge.rulesUrl)}
        >
          Правила челленджа
        </Button>
      ) : null}

      <div className="mt-8 space-y-3 border-t border-border-soft pt-4">
        {activeChallengeId === challenge.id ? (
          <Button variant="secondary" onClick={() => setShowFinishOverlay(true)}>
            Завершить челлендж
          </Button>
        ) : null}
        <Button
          variant="secondary"
          className="border-[rgba(255,239,220,0.18)] text-text-primary hover:bg-[rgba(93,20,36,0.4)] active:bg-[rgba(93,20,36,0.5)]"
          onClick={() => requestResetChallengeProgress(challenge.id)}
        >
          Сбросить прогресс
        </Button>
      </div>

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
