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
    <div className="surface-card space-y-5 p-card">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">
          График материалов
        </p>
        <div className="flex items-end justify-between gap-4">
          <h3 className="font-serif text-[2rem] leading-none text-text-primary">
            {monthLabel}
          </h3>
          <div className="flex flex-wrap justify-end gap-3 text-[11px] uppercase tracking-[0.14em] text-text-secondary">
            {legend.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
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
