import type { Challenge } from "@/shared/types/content";

export const challenges: Challenge[] = [
  {
    id: "challenge-01",
    slug: "soft-funnel-reset",
    title: "Марафон мягкой воронки",
    description: "7 дней, чтобы собрать понятную маркетинговую механику без перегруза.",
    durationDays: 7,
    status: "active",
    topicIds: ["topic-funnels", "topic-sales"],
    days: [
      {
        id: "challenge-01-day-01",
        challengeId: "challenge-01",
        dayNumber: 1,
        title: "Опора продукта",
        description: "Сформулировать ядро предложения и главный результат для ученика.",
        telegramUrl: "https://t.me/example_challenge_1_day_1"
      },
      {
        id: "challenge-01-day-02",
        challengeId: "challenge-01",
        dayNumber: 2,
        title: "Логика движения",
        description: "Разложить путь человека от первого касания до заявки.",
        telegramUrl: "https://t.me/example_challenge_1_day_2"
      }
    ]
  },
  {
    id: "challenge-02",
    slug: "content-reset",
    title: "Контент без хаоса",
    description: "14 дней на выстраивание спокойной и системной контент-работы.",
    durationDays: 14,
    status: "active",
    topicIds: ["topic-content", "topic-mindset"],
    days: [
      {
        id: "challenge-02-day-01",
        challengeId: "challenge-02",
        dayNumber: 1,
        title: "Контентная опора",
        description: "Определить 3 смысловые линии контента.",
        telegramUrl: "https://t.me/example_challenge_2_day_1"
      },
      {
        id: "challenge-02-day-02",
        challengeId: "challenge-02",
        dayNumber: 2,
        title: "Темы на месяц",
        description: "Собрать запас тем без ощущения контент-цирка.",
        telegramUrl: "https://t.me/example_challenge_2_day_2"
      }
    ]
  }
];
