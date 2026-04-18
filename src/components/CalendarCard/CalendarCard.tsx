import { CalendarDateCell } from "@/components/CalendarDateCell/CalendarDateCell";

type CalendarDayData = {
  date: string;
  label: number;
  eventTypes: string[];
};

type CalendarCardProps = {
  monthLabel: string;
  days: CalendarDayData[];
};

const legend = [
  { label: "уроки", color: "bg-accent-deep" },
  { label: "эфиры", color: "bg-[#8a342e]" },
  { label: "подкасты", color: "bg-[#c98e85]" },
  { label: "марафон", color: "bg-accent-gold" }
];

export function CalendarCard({ monthLabel, days }: CalendarCardProps) {
  return (
    <div className="surface-card max-h-[46vh] space-y-4 overflow-hidden p-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
          График материалов
        </p>
        <div className="flex items-end justify-between gap-4">
          <h3 className="font-serif text-[1.56rem] leading-[0.98] text-text-primary">
            {monthLabel}
          </h3>
          <div className="flex max-w-[58%] flex-wrap justify-end gap-x-2.5 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-text-secondary">
            {legend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <CalendarDateCell
            key={day.date}
            date={day.date}
            label={day.label}
            eventTypes={day.eventTypes}
            isToday={day.date === "2026-03-12"}
          />
        ))}
      </div>
    </div>
  );
}
