import { Link } from "react-router-dom";
import type { Challenge } from "@/shared/types/content";

type CalendarChallengeDayCardProps = {
  challenge: Challenge;
};

function formatChallengeStartDate(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long"
  }).format(new Date(`${value}T00:00:00`));
}

export function CalendarChallengeDayCard({ challenge }: CalendarChallengeDayCardProps) {
  const startLabel = formatChallengeStartDate(challenge.startDate);

  return (
    <article className="surface-card space-y-3 p-card">
      <div className="space-y-1.5">
        <p className="type-meta">
          движуха · {challenge.durationDays} дней
        </p>
        <h3 className="font-serif text-[1.22rem] leading-[1] text-text-primary">
          {challenge.title}
        </h3>
        <p className="type-body">
          {challenge.description}
        </p>
        {startLabel ? (
          <p className="type-meta text-text-primary">
            старт будет {startLabel}
          </p>
        ) : null}
      </div>
      <Link
        to={`/challenges/${challenge.id}`}
        className="button-secondary-compact pressable inline-flex min-h-11 items-center justify-center rounded-button px-4 py-2.5 text-[13px] font-semibold leading-none"
      >
        Посмотреть
      </Link>
    </article>
  );
}
