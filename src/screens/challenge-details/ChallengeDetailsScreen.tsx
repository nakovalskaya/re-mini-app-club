import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { ChallengeDayCard } from "@/components/ChallengeDayCard/ChallengeDayCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getChallengeById, getChallenges } from "@/features/challenges/selectors";

export function ChallengeDetailsScreen() {
  const { id } = useParams();
  const {
    activeChallengeId,
    toggleChallengeDay,
    getCompletedCount,
    completedDayIdsByChallenge,
    isChallengeTaken,
    isChallengeCompleted,
    takeChallenge
  } = useAppState();
  const challenge = id ? getChallengeById(id) : null;
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  useEffect(() => {
    if (challenge?.days[0]) {
      setSelectedDayId(challenge.days[0].id);
    }
  }, [challenge]);

  const isTaken = challenge ? isChallengeTaken(challenge.id) : false;
  const completedDayIds = challenge ? completedDayIdsByChallenge[challenge.id] ?? [] : [];
  const completedCount = challenge ? getCompletedCount(challenge.id) : 0;

  const selectedDay = useMemo(
    () => challenge?.days.find((day) => day.id === selectedDayId) ?? challenge?.days[0] ?? null,
    [challenge, selectedDayId]
  );

  const challenges = getChallenges();
  const activeChallengeObj = activeChallengeId ? challenges.find((c) => c.id === activeChallengeId) : null;
  const isAnyActive = activeChallengeObj != null && !isChallengeCompleted(activeChallengeObj.id, activeChallengeObj.durationDays);

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

    if (!isTaken) {
      return dayNumber <= 3 ? ("preview" as const) : ("locked" as const);
    }

    const nextAvailable = completedCount + 1;
    if (dayNumber === nextAvailable) {
      return "current" as const;
    }
    if (dayNumber < nextAvailable) {
      return "skipped" as const;
    }
    return "locked" as const;
  };

  const isChallengeDone = completedCount >= challenge.durationDays;

  return (
    <section className="screen-stack">
      <SectionTitle
        title={challenge.title}
        eyebrow="Челлендж"
        description={challenge.description}
      />

      <div className="surface-card space-y-5 p-card">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              {challenge.durationDays} дней · сложность {challenge.difficulty}/5
            </p>
            <ProgressBar value={completedCount} max={challenge.durationDays} />
            {isChallengeDone && (
              <p className="text-sm font-semibold text-[#66b37a]">
                Поздравляем! Челлендж полностью пройден.
              </p>
            )}
          </div>
          {!isTaken && (
            <div className="flex flex-col items-end gap-2">
              <Button
                className="w-auto px-5"
                onClick={() => takeChallenge(challenge.id)}
                disabled={isAnyActive}
              >
                Начать
              </Button>
              {isAnyActive && (
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-secondary text-right max-w-[120px]">
                  Сначала завершите текущий
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-3 sm:grid-cols-6">
          {challenge.days.map((day) => {
            const status = getDayStatus(day.dayNumber, day.id);
            const isSelected = selectedDay?.id === day.id;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => {
                  if (status !== "locked") {
                    setSelectedDayId(day.id);
                  }
                }}
                className={`pressable flex aspect-square items-center justify-center rounded-full border text-sm font-semibold ${
                  status === "completed"
                    ? "border-[#f0cf8e] bg-[#fff2dc] text-accent-deep"
                    : status === "current"
                      ? "border-accent-deep bg-accent-deep text-bg-base"
                      : status === "skipped"
                        ? "border-[#ebdcd5] bg-[#ebdcd5] text-[#8c7b74]"
                        : status === "preview"
                          ? "border-border-medium bg-bg-soft text-text-primary"
                          : "border-border-soft bg-bg-surface text-text-secondary"
                } ${isSelected ? "ring-2 ring-accent-gold/50" : ""}`}
                disabled={status === "locked"}
              >
                {status === "locked" ? "·" : day.dayNumber}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay ? (
        <ChallengeDayCard
          day={selectedDay}
          status={getDayStatus(selectedDay.dayNumber, selectedDay.id)}
          onComplete={(dayId) => toggleChallengeDay(challenge.id, dayId)}
        />
      ) : (
        <EmptyState
          title="День пока не выбран"
          description="Выбери день из верхней сетки, чтобы посмотреть задание."
        />
      )}
    </section>
  );
}
