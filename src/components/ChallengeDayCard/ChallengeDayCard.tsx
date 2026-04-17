import { Button } from "@/components/Button/Button";
import { openTelegramLink } from "@/features/telegram/telegram";
import type { ChallengeDay } from "@/shared/types/content";
import { cn } from "@/shared/utils/cn";

type ChallengeDayStatus = "completed" | "available" | "locked" | "preview";

type ChallengeDayCardProps = {
  day: ChallengeDay;
  status: ChallengeDayStatus;
  onComplete: (dayId: string) => void;
};

export function ChallengeDayCard({
  day,
  status,
  onComplete
}: ChallengeDayCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isPreview = status === "preview";

  return (
    <div
      className={cn(
        "surface-card flex min-h-[280px] flex-col gap-5 p-card",
        isCompleted && "bg-[#fff8ef]",
        isLocked && "opacity-75"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold",
                isCompleted && "border-[#f0cf8e] bg-[#fff2dc] text-accent-deep",
                status === "available" && "border-accent-deep bg-accent-deep text-bg-base",
                isPreview && "border-border-medium bg-bg-soft text-text-primary",
                isLocked && "border-border-soft bg-bg-surface text-text-secondary"
              )}
            >
              {day.dayNumber}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                день {day.dayNumber}
              </p>
              <h3 className="font-serif text-[1.65rem] leading-none text-text-primary">
                {day.title}
              </h3>
            </div>
          </div>
          {isLocked ? (
            <span className="rounded-full border border-border-soft px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-text-secondary">
              locked
            </span>
          ) : isCompleted ? (
            <span className="rounded-full bg-[#fff2dc] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-accent-deep">
              done
            </span>
          ) : null}
        </div>

        <p className="text-sm leading-6 text-text-secondary">{day.description}</p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border-soft pt-4">
        <Button
          variant="secondary"
          disabled={isLocked}
          onClick={() => openTelegramLink(day.telegramUrl)}
        >
          Открыть
        </Button>
        <Button
          disabled={isLocked || isCompleted || isPreview}
          onClick={() => onComplete(day.id)}
        >
          {isCompleted ? "Выполнено" : "Выполнил"}
        </Button>
      </div>
    </div>
  );
}
