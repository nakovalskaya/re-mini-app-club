import { Link } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import type { Challenge } from "@/shared/types/content";

type ChallengeCardProps = {
  challenge: Challenge;
  completedDays: number;
  status?: "default" | "taken" | "completed" | "active";
  onTakeChallenge: (challengeId: string) => void;
  canTakeNewChallenge?: boolean; // Can be kept for safety, but we want to allow clicking to trigger the prompt
};

function formatChallengeStartDate(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
  }).format(new Date(`${value}T00:00:00`));
}

export function ChallengeCard({
  challenge,
  completedDays,
  status = "default",
  onTakeChallenge
}: ChallengeCardProps) {
  const hasDays = challenge.days.length > 0;
  const startLabel = formatChallengeStartDate(challenge.startDate);
  const isAnnouncement = !hasDays && Boolean(startLabel);
  const effectiveStatus = hasDays ? status : "default";
  const isActive = effectiveStatus === "active";
  const badgeLabel =
    isAnnouncement ? `старт ${startLabel}` :
    effectiveStatus === "completed" ? "пройден" :
    effectiveStatus === "taken" ? "завершен" :
    effectiveStatus === "active" ? "активен" : null;
  const badgeClassName =
    isAnnouncement
      ? "status-chip-active"
      : effectiveStatus === "completed"
      ? "status-chip-completed"
      : effectiveStatus === "taken"
        ? "status-chip-finished"
        : effectiveStatus === "active"
          ? "status-chip-active"
          : "";

  return (
    <div className="surface-card flex flex-col gap-4 p-card">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="type-card-eyebrow">
              челлендж
            </p>
            <h3 className="type-card-title mt-1.5 font-serif text-text-primary">
              {challenge.title}
            </h3>
          </div>
          {badgeLabel ? (
            <span
              className={`chip-label rounded-full border px-3 py-1 ${badgeClassName}`}
            >
              {badgeLabel}
            </span>
          ) : null}
        </div>
        <p className="type-body">
          {challenge.description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 text-[0.92rem] leading-6 text-text-secondary">
        <span>{challenge.durationDays} дней</span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={`${challenge.id}-difficulty-${index + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${index < challenge.difficulty ? "difficulty-dot-filled" : "bg-bg-soft border border-border-soft"}`}
            />
          ))}
        </div>
      </div>

      {hasDays && effectiveStatus !== "default" ? (
        <div className="space-y-2">
          <ProgressBar value={completedDays} max={challenge.durationDays} />
        </div>
      ) : null}

      {!hasDays ? (
        <Link
          to={`/challenges/${challenge.id}`}
          className="button-secondary-compact pressable inline-flex min-h-11 items-center justify-center rounded-button px-4 py-2.5 text-[13px] font-semibold leading-none"
        >
          Посмотреть
        </Link>
      ) : !isActive ? (
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/challenges/${challenge.id}`}
            className="button-secondary-compact pressable inline-flex min-h-11 items-center justify-center rounded-button px-4 py-2.5 text-[13px] font-semibold leading-none"
          >
            Посмотреть
          </Link>
          <Button onClick={() => onTakeChallenge(challenge.id)}>
            {effectiveStatus === "taken" || effectiveStatus === "completed" ? "Начать заново" : "Начать"}
          </Button>
        </div>
      ) : (
        <Link
          to={`/challenges/${challenge.id}`}
          className="button-primary-accent pressable inline-flex min-h-11 items-center justify-center rounded-button px-4 py-2.5 text-[13px] font-semibold leading-none"
        >
          Открыть
        </Link>
      )}
    </div>
  );
}
