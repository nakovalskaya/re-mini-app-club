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
        "surface-card-elevated flex min-h-[300px] flex-col gap-0 p-card",
        isCompleted && "status-surface-completed",
        isSkipped && "status-surface-skipped",
        isLocked && "opacity-75"
      )}
    >
      <div className="mb-4 flex h-[48px] items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200",
              isCompleted && "status-chip-completed",
              isCurrent && "border-accent-deep bg-bg-surface text-accent-deep shadow-soft",
              isSkipped && "status-chip-skipped",
              isPreview && "border-border-medium bg-bg-soft text-text-primary",
              isLocked && "border-border-soft bg-bg-surface text-text-secondary"
            )}
          >
            {isCompleted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : isLocked ? (
              "·"
            ) : (
              day.dayNumber
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-text-secondary leading-none mb-1.5">
              день {day.dayNumber}
            </p>
            <h3 className="font-serif text-lg sm:text-[1.3rem] leading-tight text-text-primary line-clamp-2">
              {day.title}
            </h3>
          </div>
        </div>
        <div className="flex h-11 items-center">
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
           <span className="status-chip-active rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap">
              текущий
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-[80px]">
        <p className="text-[13px] sm:text-sm leading-6 text-text-secondary line-clamp-4 sm:line-clamp-none">
          {day.description}
        </p>
      </div>

      <div className="mt-5 flex h-12 items-center gap-3 border-t border-border-soft pt-4">
        <Button
          variant="secondary"
          disabled={isLocked}
          onClick={() => openTelegramLink(day.telegramUrl)}
          className="h-full flex-1 rounded-[16px]"
        >
          Открыть задание
        </Button>
        <div className="flex items-center gap-2">
          {onSkip && (
            <button
              onClick={() => onSkip(day.id)}
              disabled={isLocked || isPreview || readOnly}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300",
                isSkipped 
                  ? "status-chip-skipped" 
                  : "bg-bg-surface border-border-soft text-text-secondary opacity-60 hover:opacity-100",
                (isLocked || isPreview || readOnly) && "opacity-40 cursor-not-allowed"
              )}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
          <button
            onClick={() => onComplete(day.id)}
            disabled={isLocked || isPreview || readOnly}
            className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300",
              isCompleted 
                ? "border-transparent"
                : "bg-bg-surface border-border-soft text-text-secondary opacity-60 hover:opacity-100",
              (isLocked || isPreview || readOnly) && "opacity-40 cursor-not-allowed"
            )}
            style={
              isCompleted
                ? {
                    backgroundColor: "var(--color-status-done-fill)",
                    borderColor: "var(--color-status-done-fill)",
                    color: "var(--color-status-done-fill-text)"
                  }
                : undefined
            }
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
