import type { Topic } from "../shared/types/content.js";

export const topics: Topic[] = [
  { id: "topic-ai", slug: "ai", title: "Нейросети", order: 1, isVisible: true },
  { id: "topic-mindset", slug: "mindset", title: "Мышление", order: 2, isVisible: true },
  { id: "topic-reels", slug: "reels", title: "Reels", order: 3, isVisible: true },
  { id: "topic-trends", slug: "trends", title: "Тренды", order: 4, isVisible: true },
  { id: "topic-sales", slug: "sales", title: "Продажи", order: 5, isVisible: true },
  { id: "topic-content", slug: "content", title: "Контент", order: 6, isVisible: true },
  { id: "topic-funnels", slug: "funnels", title: "Воронки", order: 7, isVisible: true },
  { id: "topic-brand", slug: "brand", title: "Личный бренд", order: 8, isVisible: true }
];
