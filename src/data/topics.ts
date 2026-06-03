import type { Topic } from "../shared/types/content.js";

export const topics: Topic[] = [
  {
    id: "topic-ai",
    slug: "ai",
    title: "Нейросети",
    description: "Промпты, связки и инструкции по нейросетям",
    order: 1,
    isVisible: true
  },
  {
    id: "topic-useful-links",
    slug: "useful-links",
    title: "Полезные ссылки",
    description: "Подборка проверенных сервисов, способы оплаты, промо-ссылки со скидками",
    order: 2,
    isVisible: true
  },
  {
    id: "topic-mindset",
    slug: "mindset",
    title: "Мышление",
    description: "Эффективность, дисциплина, предпринимательское и системное мышление",
    order: 3,
    isVisible: true
  },
  {
    id: "topic-marketing",
    slug: "marketing",
    title: "Маркетинг",
    description: "База маркетинга: концепции, приёмы и тенденции",
    order: 4,
    isVisible: true
  },
  {
    id: "topic-sales",
    slug: "sales",
    title: "Продажи",
    description: "Техники, логика и психология продаж",
    order: 5,
    isVisible: true
  },
  {
    id: "topic-content",
    slug: "content",
    title: "Контент",
    description: "Форматы, техники, разборы и контент-стратегия",
    order: 6,
    isVisible: true
  },
  {
    id: "topic-brand",
    slug: "brand",
    title: "Личный бренд",
    description: "Позиционирование, упаковка и стратегия",
    order: 7,
    isVisible: true
  },
  {
    id: "topic-other",
    slug: "other",
    title: "Другое",
    description: "Хранилище инструкций и доп материалов на разные темы",
    order: 8,
    isVisible: true
  }
];
