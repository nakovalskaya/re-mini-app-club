import { categories } from "@/data/categories";
import { topics } from "@/data/topics";
import type { Material } from "@/shared/types/content";

export type CalendarDayCell = {
  date: string;
  label: number;
  eventTypes: string[];
  isCurrentMonth: boolean;
};

const visibleCategories = [...categories]
  .sort((a, b) => a.order - b.order)
  .filter((item) => item.isVisible);

const visibleTopics = [...topics]
  .sort((a, b) => a.order - b.order)
  .filter((item) => item.isVisible);

export function getVisibleCategories() {
  return visibleCategories;
}

export function getVisibleTopics() {
  return visibleTopics;
}

function sortMaterials(materials: Material[]) {
  return [...materials].sort((a, b) => b.orderWeight - a.orderWeight);
}

export function getRecommendedMaterials(materials: Material[]) {
  return sortMaterials(
    materials.filter(
      (material) => material.status === "published" && material.tags.includes("recommended")
    )
  );
}

export function getMaterialsByCategorySlug(materials: Material[], slug: string) {
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    return [];
  }

  return sortMaterials(materials.filter((material) => material.categoryId === category.id));
}

export function getMaterialsByTopicSlug(materials: Material[], slug: string) {
  const topic = topics.find((item) => item.slug === slug);
  if (!topic) {
    return [];
  }

  return sortMaterials(materials.filter((material) => material.topicIds.includes(topic.id)));
}

export function getMaterialById(materials: Material[], id: string) {
  return materials.find((material) => material.id === id) ?? null;
}

export function getMaterialsByDate(materials: Material[], date: string) {
  return sortMaterials(
    materials.filter((material) => material.scheduledAt === date || material.publishedAt === date)
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCalendarMonthStart(baseDate = new Date()) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
}

export function shiftCalendarMonth(baseDate: Date, diff: number) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + diff, 1);
}

export function buildCalendarMonth(materials: Material[], monthDate: Date): CalendarDayCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - firstWeekday;
    const cellDate = new Date(year, month, dayOffset + 1);
    const date = formatDateKey(cellDate);
    const eventTypes = getMaterialsByDate(materials, date).map((material) => material.calendarColorKey);

    return {
      date,
      label: cellDate.getDate(),
      eventTypes,
      isCurrentMonth: cellDate.getMonth() === month
    };
  });
}

export function getCategoryBySlug(slug: string) {
  return categories.find((item) => item.slug === slug) ?? null;
}

export function getTopicBySlug(slug: string) {
  return topics.find((item) => item.slug === slug) ?? null;
}
