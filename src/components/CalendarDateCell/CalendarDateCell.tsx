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
    return <div className="h-[54px] rounded-[10px] bg-transparent" aria-hidden="true" />;
  }

  return (
    <Link
      to={`/calendar/${date}`}
      className={cn(
        "pressable flex h-[54px] flex-col items-start justify-between rounded-[10px] border px-2 py-2 text-left text-text-primary",
        eventTypes.length > 0
          ? "border-border-medium bg-bg-surface shadow-soft"
          : "border-border-soft bg-[rgba(255,248,247,0.72)]",
        isToday && "ring-1 ring-accent-gold"
      )}
    >
      <span className="text-[13px] font-semibold leading-none">{label}</span>
      <div className="flex items-center gap-1.5">
        {eventTypes.slice(0, 3).map((type, index) => (
          <span
            key={`${date}-${type}-${index}`}
            className={cn("h-2.5 w-2.5 rounded-full", eventTypeClasses[type] ?? "bg-accent-gold")}
          />
        ))}
      </div>
    </Link>
  );
}
