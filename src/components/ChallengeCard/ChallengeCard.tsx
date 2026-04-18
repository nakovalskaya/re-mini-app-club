import { Link } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import type { Challenge } from "@/shared/types/content";

type ChallengeCardProps = {
  challenge: Challenge;
  completedDays: number;
  status?: "default" | "taken" | "completed" | "active";
  onTakeChallenge: (challengeId: string) => void;
};

export function ChallengeCard({
  challenge,
  completedDays,
  status = "default",
  onTakeChallenge
}: ChallengeCardProps) {
  const isActive = status === "active";
  const isTaken = status === "taken" || status === "active" || status === "completed";
  const isCompleted = status === "completed";
  const badgeLabel = isCompleted ? "пройден" : isActive ? "активен" : isTaken ? "взят" : null;
  const actionLabel = isActive
    ? "Продолжить"
    : isTaken
      ? "Сделать активным"
      : "Взять челлендж";

  return (
    <div className="surface-card flex flex-col gap-5 p-card">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
              челлендж
            </p>
            <h3 className="mt-2 font-serif text-[1.9rem] leading-none text-text-primary">
              {challenge.title}
            </h3>
          </div>
          {badgeLabel ? (
            <span className="rounded-full bg-[#fff2dc] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-deep">
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

      <div className="space-y-2">
        <ProgressBar value={completedDays} max={challenge.durationDays} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to={`/challenges/${challenge.id}`}
          className="pressable inline-flex min-h-12 items-center justify-center rounded-button border border-border-medium bg-bg-surface px-5 py-3 text-sm font-semibold text-text-primary"
        >
          Посмотреть
        </Link>
        <Button onClick={() => onTakeChallenge(challenge.id)}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
