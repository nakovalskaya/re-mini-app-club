import type { Category } from "../shared/types/content.js";

export const categories: Category[] = [
  {
    id: "cat-lives",
    slug: "lives",
    title: "Эфиры",
    description: "Живые разборы, практические зумы и лекции с контентом",
    order: 1,
    isVisible: true
  },
  {
    id: "cat-lessons",
    slug: "lessons",
    title: "Лекции",
    description: "Разборы, инструкции и уроки",
    order: 2,
    isVisible: true
  },
  {
    id: "cat-podcasts",
    slug: "podcasts",
    title: "Подкасты",
    description: "Короткие и длинные подкасты на разные темы",
    order: 3,
    isVisible: true
  },
  {
    id: "cat-library",
    slug: "library",
    title: "Гиды",
    description: "Гайды, статьи и методички",
    order: 4,
    isVisible: true
  }
];
