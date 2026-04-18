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
};

export function ChallengeDayCard({
  day,
  status,
  onComplete,
  onSkip
}: ChallengeDayCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";
  const isPreview = status === "preview";
  const isCurrent = status === "current" || status === "available"; // visual treatment

  return (
    <div
      className={cn(
        "surface-card flex min-h-[300px] flex-col gap-0 p-card",
        isCompleted && "bg-[#fff8ef]",
        isSkipped && "bg-[#f8f5f4]",
        isLocked && "opacity-75"
      )}
    >
      <div className="flex h-[48px] items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200",
              isCompleted && "border-[#f0cf8e] bg-[#fff2dc] text-accent-deep",
              isCurrent && "border-accent-deep bg-accent-deep text-bg-base",
              isSkipped && "border-[#ebdcd5] bg-[#ebdcd5] text-[#8c7b74]",
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
          ) : isCompleted ? (
            <span className="rounded-full bg-[#fff2dc] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-accent-deep whitespace-nowrap">
              пройден
            </span>
          ) : isSkipped ? (
            <span className="rounded-full border border-border-medium bg-bg-soft px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-text-secondary whitespace-nowrap">
              пропущен
            </span>
          ) : isCurrent ? (
           <span className="rounded-full bg-[#e8f3ed] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2c6e49] whitespace-nowrap">
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
          className="h-full flex-1"
        >
          Открыть задание
        </Button>
        <div className="flex items-center gap-2">
          {onSkip && (
            <button
              onClick={() => onSkip(day.id)}
              disabled={isLocked || isPreview}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300",
                isSkipped 
                  ? "bg-[#ebdcd5] border-[#ebdcd5] text-[#8c7b74]" 
                  : "bg-bg-surface border-border-soft text-text-secondary opacity-60 hover:opacity-100",
                (isLocked || isPreview) && "opacity-40 cursor-not-allowed"
              )}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
          <button
            onClick={() => onComplete(day.id)}
            disabled={isLocked || isPreview}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-300",
              isCompleted 
                ? "bg-[#66b37a] border-[#66b37a] text-white" 
                : "bg-bg-surface border-border-soft text-text-secondary opacity-60 hover:opacity-100",
              (isLocked || isPreview) && "opacity-40 cursor-not-allowed"
            )}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
