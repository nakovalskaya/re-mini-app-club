import { useMemo, useState } from "react";
import { useMaterials } from "@/app/providers/MaterialsProvider";
import { CalendarDateCell } from "@/components/CalendarDateCell/CalendarDateCell";
import {
  buildCalendarMonth,
  getCalendarMonthStart,
  shiftCalendarMonth
} from "@/features/materials/selectors";

const legend = [
  { label: "лекции", color: "calendar-dot-lesson" },
  { label: "эфиры", color: "calendar-dot-live" },
  { label: "подкасты", color: "calendar-dot-podcast" },
  { label: "гиды", color: "calendar-dot-guide" },
  { label: "движуха", color: "calendar-dot-challenge" }
];

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric"
});

export function CalendarCard() {
  const { materials, isLoading } = useMaterials();
  const currentMonth = useMemo(() => getCalendarMonthStart(), []);
  const [monthOffset, setMonthOffset] = useState(0);
  const monthDate = useMemo(
    () => shiftCalendarMonth(currentMonth, monthOffset),
    [currentMonth, monthOffset]
  );
  const days = useMemo(() => buildCalendarMonth(materials, monthDate), [materials, monthDate]);
  const monthLabel = useMemo(() => {
    const formatted = monthFormatter.format(monthDate);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [monthDate]);

  if (isLoading) {
    return (
      <div className="surface-card space-y-3 p-[15px]">
        <div className="space-y-1">
          <p className="type-page-eyebrow tracking-[0.12em]">
            Календарь
          </p>
          <p className="type-body">
            Загружаем даты опубликованных материалов из Notion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card space-y-3 p-[15px]">
      <div className="flex items-center justify-between gap-3">
        {monthOffset > 0 ? (
          <button
            type="button"
            aria-label="Предыдущий месяц"
            className="button-secondary-compact pressable inline-flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-[13px]"
            onClick={() => setMonthOffset(monthOffset - 1)}
          >
            ←
          </button>
        ) : (
          // Spacer keeps the title centred when there's no back button.
          <div className="h-[2.15rem] w-[2.15rem]" aria-hidden="true" />
        )}

        <div className="min-w-0 flex-1 text-center">
          <h3 className="font-serif text-[1.28rem] leading-[1] text-text-primary">
            {monthLabel}
          </h3>
        </div>

        <button
          type="button"
          aria-label="Следующий месяц"
          className="button-secondary-compact pressable inline-flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-[13px]"
          onClick={() => setMonthOffset(monthOffset + 1)}
        >
          →
        </button>
      </div>

      <div key={monthLabel} className="calendar-month-animate space-y-0">
        <div className="grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="flex h-6 items-center justify-center text-[10px] uppercase tracking-[0.08em] text-text-secondary"
            >
              {label}
            </div>
          ))}

          {days.map((day) => (
            <CalendarDateCell
              key={day.date}
              date={day.date}
              label={day.label}
              eventTypes={day.eventTypes}
              isCurrentMonth={day.isCurrentMonth}
              isToday={day.date === new Date().toISOString().slice(0, 10)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-text-secondary">
        {legend.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
