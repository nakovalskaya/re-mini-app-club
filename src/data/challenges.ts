import type { Challenge, ChallengeDay } from "@/shared/types/content";

function buildChallengeDays(
  challengeId: string,
  titles: string[],
  descriptionPrefix: string
): ChallengeDay[] {
  return titles.map((title, index) => ({
    id: `${challengeId}-day-${String(index + 1).padStart(2, "0")}`,
    challengeId,
    dayNumber: index + 1,
    title,
    description: `${descriptionPrefix} День ${index + 1}: ${title.toLowerCase()}.`,
    telegramUrl: `https://t.me/${challengeId}_day_${index + 1}`
  }));
}

const reelsTitles = [
  "Опора челленджа",
  "Смыслы для коротких видео",
  "3 формата Reels под твой стиль",
  "Первый сценарий",
  "Крючок без крика",
  "Спокойная структура кадра",
  "Монтаж без визуального шума",
  "Подача через настроение",
  "Как говорить о продукте мягко",
  "Серия из 3 Reels",
  "Reels с личной историей",
  "Reels для доверия",
  "Reels для продажи",
  "Сборка контент-цепочки",
  "Финальный ритм публикации"
];

const threadsTitles = [
  "Старт и позиционирование",
  "О чём писать в Threads",
  "Тон голоса без суеты",
  "Короткие мысли, которые цепляют",
  "Развитие темы в треде",
  "Личный опыт как опора",
  "Экспертность без назидания",
  "Формула треда на сохранение",
  "Треды для узнаваемости",
  "Треды для прогрева",
  "Треды для продажи",
  "Система ежедневных тем",
  "Как реагировать на отклик",
  "Как не выгореть в ежедневном формате",
  "Контент-пакеты на неделю",
  "Сборка авторской рубрики",
  "Треды с историей клиента",
  "Треды с аналитикой",
  "Треды, которые ведут дальше",
  "Финальная личная система"
];

export const challenges: Challenge[] = [
  {
    id: "challenge-reels-15",
    slug: "reels-15",
    title: "Челлендж по Reels",
    description:
      "15 дней спокойной системы коротких видео: без гонки за трендами, с акцентом на стиль, смыслы и дорогую подачу.",
    durationDays: 15,
    difficulty: 3,
    status: "active",
    topicIds: ["topic-reels", "topic-content", "topic-brand"],
    days: buildChallengeDays(
      "challenge-reels-15",
      reelsTitles,
      "Практическое задание по Reels."
    )
  },
  {
    id: "challenge-threads-20",
    slug: "threads-20",
    title: "Челлендж по Threads",
    description:
      "20 дней, чтобы выстроить уверенную авторскую систему в Threads: короткие тексты, ясный ритм и понятная логика роста.",
    durationDays: 20,
    difficulty: 4,
    status: "active",
    topicIds: ["topic-content", "topic-brand", "topic-sales"],
    days: buildChallengeDays(
      "challenge-threads-20",
      threadsTitles,
      "Практическое задание по Threads."
    )
  }
];
