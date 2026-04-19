import type { Category } from "@/shared/types/content";

export const categories: Category[] = [
  {
    id: "cat-lives",
    slug: "lives",
    title: "Эфиры",
    description: "Живые разборы\nи лекции",
    order: 1,
    isVisible: true
  },
  {
    id: "cat-lessons",
    slug: "lessons",
    title: "Уроки",
    description: "Системные обучающие блоки",
    order: 2,
    isVisible: true
  },
  {
    id: "cat-podcasts",
    slug: "podcasts",
    title: "Подкасты",
    description: "Аудио-лекции\nна разные темы",
    order: 3,
    isVisible: true
  },
  {
    id: "cat-library",
    slug: "library",
    title: "Библиотека",
    description: "Гайды, статьи и методички",
    order: 4,
    isVisible: true
  }
];
