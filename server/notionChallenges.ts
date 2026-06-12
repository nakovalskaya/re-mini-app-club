import { topics } from "../src/data/topics.js";
import type { Challenge, ChallengeDay } from "../src/shared/types/content.js";

type FetchPublishedNotionChallengesOptions = {
  notionToken?: string;
  challengesDatabaseId?: string;
  challengeDaysDatabaseId?: string;
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
  url?: string | null;
  number?: number | null;
  checkbox?: boolean;
  relation?: Array<{ id?: string }>;
  date?: { start?: string | null } | null;
};

type ChallengeDraft = Omit<Challenge, "days">;

const notionVersion = "2022-06-28";
const defaultChallengesDatabaseId = "7ed064219a2342baabd3ebe4655fc775";
const defaultChallengeDaysDatabaseId = "b61bf96fd8ea4c828d880034470a67c5";

const topicIdByTitle = new Map(topics.map((topic) => [normalize(topic.title), topic.id]));

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

function readUrl(property?: NotionProperty) {
  return property?.url?.trim() ?? "";
}

function readNumber(property?: NotionProperty) {
  return typeof property?.number === "number" && Number.isFinite(property.number)
    ? property.number
    : null;
}

function readCheckbox(property?: NotionProperty) {
  return property?.checkbox === true;
}

function readDate(property?: NotionProperty) {
  return property?.date?.start?.slice(0, 10) ?? "";
}

function readRelationIds(property?: NotionProperty) {
  return (property?.relation ?? [])
    .map((item) => item.id?.replace(/-/g, "") ?? "")
    .filter(Boolean);
}

function slugify(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function clampDifficulty(value: number | null) {
  if (value === null) {
    return 1 as const;
  }

  return Math.max(1, Math.min(5, Math.round(value))) as Challenge["difficulty"];
}

function resolveTopicIds(topicNames: string[]) {
  return topicNames
    .map((topicName) => topicIdByTitle.get(normalize(topicName)) ?? null)
    .filter((topicId): topicId is string => Boolean(topicId));
}

async function queryDatabase(
  databaseId: string,
  notionToken: string,
  fetchImpl: typeof fetch
) {
  const pages: NotionPage[] = [];
  let nextCursor: string | null = null;

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
        ...(nextCursor ? { start_cursor: nextCursor } : {})
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notion API request failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as NotionQueryResponse;
    pages.push(...payload.results);
    nextCursor = payload.has_more ? payload.next_cursor : null;
  } while (nextCursor);

  return pages;
}

function mapChallenge(page: NotionPage): ChallengeDraft | null {
  const properties = page.properties ?? {};
  const title = readTitle(properties.Name);
  const isPublished = readCheckbox(properties.Published);

  if (!title || !isPublished) {
    return null;
  }

  const slug = readRichText(properties.Slug) || slugify(title);
  if (!slug) {
    return null;
  }

  return {
    id: `challenge-${slug}`,
    slug,
    title,
    description: readRichText(properties.Description) || title,
    durationDays: Math.max(1, Math.round(readNumber(properties["Duration Days"]) ?? 1)),
    difficulty: clampDifficulty(readNumber(properties.Difficulty)),
    status: readSelect(properties.Status) === "archived" ? "archived" : "active",
    isPublished,
    startDate: readDate(properties["Start Date"]) || undefined,
    topicIds: resolveTopicIds(readMultiSelect(properties.Topics)),
    rulesUrl: readUrl(properties["Rules URL"])
  };
}

function mapChallengeDay(
  page: NotionPage,
  challengeIdByNotionId: Map<string, string>
): ChallengeDay | null {
  const properties = page.properties ?? {};
  const title = readTitle(properties.Name);
  const relationIds = readRelationIds(properties.Challenge);
  const challengeId = relationIds
    .map((relationId) => challengeIdByNotionId.get(relationId) ?? null)
    .find((value): value is string => Boolean(value));
  const dayNumber = readNumber(properties["Day Number"]);

  if (!title || !challengeId || dayNumber === null) {
    return null;
  }

  const normalizedDayNumber = Math.max(1, Math.round(dayNumber));

  return {
    id: `${challengeId}-day-${String(normalizedDayNumber).padStart(2, "0")}`,
    challengeId,
    dayNumber: normalizedDayNumber,
    title,
    description: readRichText(properties.Description) || title,
    telegramUrl: readUrl(properties["Telegram URL"]),
    scheduledAt: readDate(properties.Date) || undefined
  };
}

export async function fetchPublishedNotionChallenges({
  notionToken,
  challengesDatabaseId = defaultChallengesDatabaseId,
  challengeDaysDatabaseId = defaultChallengeDaysDatabaseId,
  fetchImpl = fetch
}: FetchPublishedNotionChallengesOptions = {}) {
  if (!notionToken) {
    throw new Error("Missing NOTION_TOKEN");
  }

  const [challengePages, challengeDayPages] = await Promise.all([
    queryDatabase(challengesDatabaseId, notionToken, fetchImpl),
    queryDatabase(challengeDaysDatabaseId, notionToken, fetchImpl)
  ]);

  const challengeIdByNotionId = new Map<string, string>();
  const challengeDrafts = challengePages
    .map((page) => {
      const challenge = mapChallenge(page);
      if (challenge) {
        challengeIdByNotionId.set(page.id.replace(/-/g, ""), challenge.id);
      }
      return challenge;
    })
    .filter((challenge): challenge is ChallengeDraft => Boolean(challenge));

  const daysByChallengeId = challengeDayPages.reduce<Record<string, ChallengeDay[]>>((acc, page) => {
    const day = mapChallengeDay(page, challengeIdByNotionId);
    if (!day) {
      return acc;
    }

    acc[day.challengeId] ??= [];
    acc[day.challengeId].push(day);
    return acc;
  }, {});

  return challengeDrafts
    .map((challenge) => {
      const days = [...(daysByChallengeId[challenge.id] ?? [])].sort(
        (a, b) => a.dayNumber - b.dayNumber
      );

      return {
        ...challenge,
        durationDays: Math.max(challenge.durationDays, days.length || challenge.durationDays),
        days
      };
    })
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }

      return a.title.localeCompare(b.title, "ru");
    });
}
