import { categories } from "../src/data/categories.js";
import { topics } from "../src/data/topics.js";
import type { Material, MaterialType } from "../src/shared/types/content.js";

type FetchPublishedNotionMaterialsOptions = {
  notionToken?: string;
  databaseId?: string;
  fetchImpl?: typeof fetch;
};

type NotionQueryResponse = {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
};

type NotionPage = {
  id: string;
  last_edited_time?: string;
  created_time?: string;
  properties?: Record<string, NotionProperty>;
};

type NotionProperty = {
  type?: string;
  title?: Array<{ plain_text?: string; text?: { content?: string } }>;
  rich_text?: Array<{ plain_text?: string; text?: { content?: string } }>;
  select?: { name?: string | null } | null;
  multi_select?: Array<{ name?: string | null }>;
  checkbox?: boolean;
  url?: string | null;
  date?: { start?: string | null } | null;
};

const notionVersion = "2022-06-28";

const typeMap: Record<string, MaterialType> = {
  урок: "lesson",
  эфир: "live",
  подкаст: "podcast",
  гайд: "guide",
  статья: "article"
};

const categoryIdByTitle = new Map(
  categories.map((category) => [normalize(category.title), category.id])
);
const topicIdByTitle = new Map(topics.map((topic) => [normalize(topic.title), topic.id]));

const categoryFallbackByType: Record<MaterialType, Material["categoryId"]> = {
  lesson: "cat-lessons",
  live: "cat-lives",
  podcast: "cat-podcasts",
  guide: "cat-library",
  article: "cat-library"
};

const coverFallbackByCategory: Record<Material["categoryId"], string> = {
  "cat-lives": "/category-covers/head.jpg",
  "cat-lessons": "/category-covers/hand.jpg",
  "cat-podcasts": "/category-covers/microphone.jpg",
  "cat-library": "/category-covers/books.jpg"
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function readPlainText(items: Array<{ plain_text?: string; text?: { content?: string } }> = []) {
  return items.map((item) => item.plain_text ?? item.text?.content ?? "").join("").trim();
}

function readTitle(property?: NotionProperty) {
  return readPlainText(property?.title);
}

function readRichText(property?: NotionProperty) {
  return readPlainText(property?.rich_text);
}

function readSelect(property?: NotionProperty) {
  return property?.select?.name?.trim() ?? "";
}

function readMultiSelect(property?: NotionProperty) {
  return (property?.multi_select ?? [])
    .map((item) => item.name?.trim() ?? "")
    .filter(Boolean);
}

function readCheckbox(property?: NotionProperty) {
  return Boolean(property?.checkbox);
}

function readUrl(property?: NotionProperty) {
  return property?.url?.trim() ?? "";
}

function readDate(property?: NotionProperty) {
  return property?.date?.start?.slice(0, 10) ?? "";
}

function resolveCategoryId(type: MaterialType, categoryName: string) {
  return categoryIdByTitle.get(normalize(categoryName)) ?? categoryFallbackByType[type];
}

function resolveTopicIds(topicNames: string[]) {
  return topicNames
    .map((topicName) => topicIdByTitle.get(normalize(topicName)) ?? null)
    .filter((topicId): topicId is string => Boolean(topicId));
}

function resolveCalendarColorKey(type: MaterialType) {
  if (type === "live") {
    return "live";
  }

  if (type === "podcast") {
    return "podcast";
  }

  return "lesson";
}

function defaultDurationByType(type: MaterialType) {
  if (type === "guide" || type === "article") {
    return "";
  }

  return "Без длительности";
}

function toOrderWeight(date: string, index: number) {
  const parsed = Date.parse(date);

  if (Number.isNaN(parsed)) {
    return 10_000 - index;
  }

  return parsed - index;
}

function mapNotionPageToMaterial(page: NotionPage, index: number): Material | null {
  const properties = page.properties ?? {};
  const title = readTitle(properties.Name);
  const typeName = normalize(readSelect(properties.Type));
  const type = typeMap[typeName];

  if (!title || !type) {
    return null;
  }

  const description = readRichText(properties.Description);
  const categoryId = resolveCategoryId(type, readSelect(properties.Category));
  const topicIds = resolveTopicIds(readMultiSelect(properties.Topics));
  const publishedAt =
    readDate(properties.Date) ||
    page.last_edited_time?.slice(0, 10) ||
    page.created_time?.slice(0, 10) ||
    new Date().toISOString().slice(0, 10);
  const isPublished = readCheckbox(properties.Published);
  const coverImage = readUrl(properties.Cover) || coverFallbackByCategory[categoryId];
  const duration = readRichText(properties.Duration) || defaultDurationByType(type);
  const tags = readCheckbox(properties.Recommended) ? ["recommended"] : [];
  const status: Material["status"] = isPublished ? "published" : publishedAt ? "scheduled" : "hidden";

  if (status === "hidden") {
    return null;
  }

  return {
    id: `notion-${page.id.replace(/-/g, "")}`,
    type,
    categoryId,
    topicIds,
    title,
    shortDescription: description || title,
    longDescription: description || undefined,
    telegramUrl: readUrl(properties["Telegram URL"]),
    coverImage,
    duration,
    status,
    publishedAt,
    scheduledAt: publishedAt,
    tags,
    orderWeight: toOrderWeight(publishedAt, index),
    calendarColorKey: resolveCalendarColorKey(type)
  };
}

export async function fetchPublishedNotionMaterials({
  notionToken,
  databaseId,
  fetchImpl = fetch
}: FetchPublishedNotionMaterialsOptions = {}) {
  if (!notionToken) {
    throw new Error("Missing NOTION_TOKEN");
  }

  if (!databaseId) {
    throw new Error("Missing NOTION_DATABASE_ID");
  }

  const materials: Material[] = [];
  let nextCursor: string | null = null;
  let pageIndex = 0;

  do {
    const response = await fetchImpl(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": notionVersion
      },
      body: JSON.stringify({
        page_size: 100,
        ...(nextCursor ? { start_cursor: nextCursor } : {}),
        sorts: [
          {
            property: "Date",
            direction: "descending"
          },
          {
            timestamp: "last_edited_time",
            direction: "descending"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notion API request failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as NotionQueryResponse;

    payload.results.forEach((page) => {
      const material = mapNotionPageToMaterial(page, pageIndex);

      if (material) {
        materials.push(material);
        pageIndex += 1;
      }
    });

    nextCursor = payload.has_more ? payload.next_cursor : null;
  } while (nextCursor);

  return materials.sort((a, b) => b.orderWeight - a.orderWeight);
}
