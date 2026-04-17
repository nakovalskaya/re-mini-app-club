import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/Button/Button";
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
    completeChallengeDay,
    getCompletedCount,
    challengeProgress,
    takeChallenge
  } = useAppState();
  const challenge = id ? getChallengeById(id) : null;
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  useEffect(() => {
    if (challenge?.days[0]) {
      setSelectedDayId(challenge.days[0].id);
    }
  }, [challenge]);

  const isTaken = challenge ? activeChallengeId === challenge.id : false;
  const completedDayIds = challenge ? challengeProgress[challenge.id] ?? [] : [];
  const completedCount = challenge ? getCompletedCount(challenge.id) : 0;

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

    if (!isTaken) {
      return dayNumber <= 3 ? ("preview" as const) : ("locked" as const);
    }

    const nextAvailable = completedCount + 1;
    return dayNumber <= nextAvailable ? ("available" as const) : ("locked" as const);
  };

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
          </div>
          {!isTaken ? (
            <Button className="w-auto px-5" onClick={() => takeChallenge(challenge.id)}>
              Взять челлендж
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-5 gap-3 sm:grid-cols-6">
          {challenge.days.map((day) => {
            const status = getDayStatus(day.dayNumber, day.id);

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
                    : status === "available"
                      ? "border-accent-deep bg-accent-deep text-bg-base"
                      : status === "preview"
                        ? "border-border-medium bg-bg-soft text-text-primary"
                        : "border-border-soft bg-bg-surface text-text-secondary"
                } ${selectedDay?.id === day.id ? "ring-2 ring-accent-gold/40" : ""}`}
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
          onComplete={(dayId) => completeChallengeDay(challenge.id, dayId)}
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
