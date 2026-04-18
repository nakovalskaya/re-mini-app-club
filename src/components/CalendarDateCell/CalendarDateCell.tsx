import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

type CalendarDateCellProps = {
  date: string;
  label: number;
  eventTypes: string[];
  isToday?: boolean;
};

const eventTypeClasses: Record<string, string> = {
  lesson: "bg-accent-deep",
  live: "bg-[#8a342e]",
  podcast: "bg-[#c98e85]",
  challenge: "bg-accent-gold"
};

export function CalendarDateCell({
  date,
  label,
  eventTypes,
  isToday = false
}: CalendarDateCellProps) {
  return (
    <Link
      to={`/calendar/${date}`}
      className={cn(
        "pressable flex min-h-[50px] flex-col items-center justify-between rounded-compact border px-1.5 py-2 text-text-primary",
        eventTypes.length > 0
          ? "border-border-medium bg-bg-surface shadow-soft"
          : "border-border-soft bg-[rgba(255,248,247,0.72)]",
        isToday && "ring-1 ring-accent-gold"
      )}
    >
      <span className="text-[13px] font-semibold leading-none">{label}</span>
      <div className="flex items-center gap-1">
        {eventTypes.slice(0, 3).map((type, index) => (
          <span
            key={`${date}-${type}-${index}`}
            className={cn("h-1.5 w-1.5 rounded-full", eventTypeClasses[type] ?? "bg-accent-gold")}
          />
        ))}
      </div>
    </Link>
  );
}
