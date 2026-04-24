import { Button } from "@/components/Button/Button";
import { openTelegramLink } from "@/features/telegram/telegram";
import type { ChallengeDay } from "@/shared/types/content";
import { cn } from "@/shared/utils/cn";

type ChallengeDayStatus = "completed" | "current" | "available" | "locked" | "preview" | "skipped";

type ChallengeDayCardProps = {
  day: ChallengeDay;
  status: ChallengeDayStatus;
  onComplete: (dayId: string) => void;
  onSkip?: (dayId: string) => void;
  readOnly?: boolean;
  readOnlyLabel?: string | null;
};

export function ChallengeDayCard({
  day,
  status,
  onComplete,
  onSkip,
  readOnly = false,
  readOnlyLabel = null
}: ChallengeDayCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";
  const isPreview = status === "preview";
  const isCurrent = status === "current" || status === "available"; // visual treatment

  return (
    <div
      className={cn(
        "surface-card-elevated flex min-h-[248px] flex-col gap-0 p-[16px]",
        isCompleted && "status-surface-completed",
        isSkipped && "status-surface-skipped",
        isLocked && "opacity-75"
      )}
    >
      <div className="mb-3">
        <div className="grid min-h-[3rem] content-start gap-1.5">
          <p className="pt-0.5 text-[10px] leading-none text-text-secondary uppercase tracking-[0.18em]">
            день {day.dayNumber}
          </p>
          <h3 className="font-serif text-[1.9rem] leading-[0.92] text-text-primary line-clamp-2 sm:text-[1.72rem]">
            {day.title}
          </h3>
        </div>
      </div>

      <div className="mb-3 min-h-[1.75rem]">
        {isLocked ? (
          <span className="rounded-full border border-border-soft px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            закрыт
          </span>
        ) : readOnly && readOnlyLabel ? (
          <span className="rounded-full border border-border-medium bg-bg-soft px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-text-secondary whitespace-nowrap">
            {readOnlyLabel}
          </span>
        ) : isCompleted ? (
          <span className="status-chip-completed rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.14em] whitespace-nowrap">
            пройден
          </span>
        ) : isSkipped ? (
          <span className="status-chip-skipped rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] whitespace-nowrap">
            пропущен
          </span>
        ) : isCurrent ? (
          <span className="status-chip-active rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap">
            активный
          </span>
        ) : null}
      </div>

      <div className="flex-1 min-h-[60px]">
        <p className="text-[13px] leading-[1.65] text-text-secondary line-clamp-3 sm:text-sm sm:line-clamp-4">
          {day.description}
        </p>
      </div>

      <div className="mt-4 flex h-11 items-center gap-2.5 border-t border-border-soft pt-3">
        <Button
          variant="secondary"
          disabled={isLocked}
          onClick={() => openTelegramLink(day.telegramUrl)}
          className="h-full flex-1 rounded-[16px] px-4 text-[12px]"
        >
          Открыть задание
        </Button>
        <div className="flex items-center gap-2">
          {onSkip && (
            <button
              onClick={() => onSkip(day.id)}
              disabled={isLocked || isPreview || readOnly}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300",
                isSkipped
                  ? "status-accent-skipped"
                  : "bg-bg-surface border-border-soft text-text-secondary opacity-60 hover:opacity-100",
                (isLocked || isPreview || readOnly) && "opacity-40 cursor-not-allowed"
              )}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
          <button
            onClick={() => onComplete(day.id)}
            disabled={isLocked || isPreview || readOnly}
            className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300",
              isCompleted 
                ? "status-accent-completed"
                : "bg-bg-surface border-border-soft text-text-secondary opacity-60 hover:opacity-100",
              (isLocked || isPreview || readOnly) && "opacity-40 cursor-not-allowed"
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
