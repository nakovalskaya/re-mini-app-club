import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

type CalendarDateCellProps = {
  date: string;
  label: number;
  eventTypes: string[];
  isCurrentMonth: boolean;
  isToday?: boolean;
};

const eventTypeClasses: Record<string, string> = {
  lesson: "bg-accent-deep",
  live: "bg-[#8a342e]",
  podcast: "bg-[#a05d8f]",
  challenge: "bg-accent-gold"
};

export function CalendarDateCell({
  date,
  label,
  eventTypes,
  isCurrentMonth,
  isToday = false
}: CalendarDateCellProps) {
  if (!isCurrentMonth) {
    return <div className="h-[50px] rounded-[9px] bg-transparent" aria-hidden="true" />;
  }

  return (
    <Link
      to={`/calendar/${date}`}
      className={cn(
        "pressable flex h-[50px] flex-col items-start justify-between rounded-[9px] border px-[7px] py-[7px] text-left text-text-primary",
        eventTypes.length > 0
          ? "border-border-medium bg-bg-surface shadow-soft"
          : "border-border-soft bg-[var(--color-surface-muted)]",
        isToday && "ring-1 ring-accent-gold"
      )}
    >
      <span className="text-[12px] font-semibold leading-none">{label}</span>
      <div className="flex items-center gap-1">
        {eventTypes.slice(0, 3).map((type, index) => (
          <span
            key={`${date}-${type}-${index}`}
            className={cn("h-2 w-2 rounded-full", eventTypeClasses[type] ?? "bg-accent-gold")}
          />
        ))}
      </div>
    </Link>
  );
}
