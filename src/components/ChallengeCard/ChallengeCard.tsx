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

export function ChallengeCard({
  challenge,
  completedDays,
  status = "default",
  onTakeChallenge
}: ChallengeCardProps) {
  const isActive = status === "active";
  const badgeLabel =
    status === "completed" ? "пройден" :
    status === "taken" ? "завершен" :
    status === "active" ? "активен" : null;
  const badgeClassName =
    status === "completed"
      ? "status-chip-completed"
      : status === "taken"
        ? "status-chip-completed"
        : status === "active"
          ? "status-chip-active"
          : "";

  return (
    <div className="surface-card flex flex-col gap-4 p-card">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
              челлендж
            </p>
            <h3 className="mt-1.5 font-serif text-[1.64rem] leading-[0.95] text-text-primary">
              {challenge.title}
            </h3>
          </div>
          {badgeLabel ? (
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClassName}`}
            >
              {badgeLabel}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-6 text-text-secondary">
          {challenge.description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-text-secondary">
        <span>{challenge.durationDays} дней</span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={`${challenge.id}-difficulty-${index + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${index < challenge.difficulty ? "bg-accent-gold" : "bg-bg-soft border border-border-soft"}`}
            />
          ))}
        </div>
      </div>

      {status !== "default" ? (
        <div className="space-y-2">
          <ProgressBar value={completedDays} max={challenge.durationDays} />
        </div>
      ) : null}

      {!isActive ? (
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/challenges/${challenge.id}`}
            className="pressable inline-flex min-h-11 items-center justify-center rounded-button border border-border-medium bg-bg-surface px-4 py-2.5 text-[13px] font-semibold leading-none text-text-primary"
          >
            Посмотреть
          </Link>
          <Button onClick={() => onTakeChallenge(challenge.id)}>
            {status === "taken" || status === "completed" ? "Начать заново" : "Начать"}
          </Button>
        </div>
      ) : (
        <Link
          to={`/challenges/${challenge.id}`}
          className="pressable inline-flex min-h-11 items-center justify-center rounded-button bg-accent-deep px-4 py-2.5 text-[13px] font-semibold leading-none text-bg-base"
        >
          Открыть
        </Link>
      )}
    </div>
  );
}
