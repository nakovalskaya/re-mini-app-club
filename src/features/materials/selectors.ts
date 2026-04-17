import { categories } from "@/data/categories";
import { materials } from "@/data/materials";
import { topics } from "@/data/topics";

export function getVisibleCategories() {
  return [...categories].sort((a, b) => a.order - b.order).filter((item) => item.isVisible);
}

export function getVisibleTopics() {
  return [...topics].sort((a, b) => a.order - b.order).filter((item) => item.isVisible);
}

export function getRecommendedMaterials() {
  return materials
    .filter((material) => material.status === "published" && material.tags.includes("recommended"))
    .sort((a, b) => b.orderWeight - a.orderWeight);
}

export function getMaterialsByCategorySlug(slug: string) {
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    return [];
  }

  return materials
    .filter((material) => material.categoryId === category.id)
    .sort((a, b) => b.orderWeight - a.orderWeight);
}

export function getMaterialsByTopicSlug(slug: string) {
  const topic = topics.find((item) => item.slug === slug);
  if (!topic) {
    return [];
  }

  return materials
    .filter((material) => material.topicIds.includes(topic.id))
    .sort((a, b) => b.orderWeight - a.orderWeight);
}

export function getMaterialById(id: string) {
  return materials.find((material) => material.id === id) ?? null;
}

export function getMaterialsByDate(date: string) {
  return materials
    .filter((material) => material.scheduledAt === date || material.publishedAt === date)
    .sort((a, b) => b.orderWeight - a.orderWeight);
}

export function buildCalendarDays(month = "2026-03") {
  return Array.from({ length: 31 }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    const date = `${month}-${day}`;
    const eventTypes = getMaterialsByDate(date).map((material) => material.calendarColorKey);

    return {
      date,
      label: index + 1,
      eventTypes
    };
  });
}

export function getCategoryBySlug(slug: string) {
  return categories.find((item) => item.slug === slug) ?? null;
}

export function getTopicBySlug(slug: string) {
  return topics.find((item) => item.slug === slug) ?? null;
}
