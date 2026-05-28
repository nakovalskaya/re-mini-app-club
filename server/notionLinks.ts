import type { RichTextSpan, UsefulLink } from "../src/shared/types/content.js";

type FetchPublishedNotionLinksOptions = {
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

type NotionRichTextItem = {
  plain_text?: string;
  href?: string | null;
  text?: { content?: string; link?: { url?: string } | null };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
};

type NotionProperty = {
  type?: string;
  title?: NotionRichTextItem[];
  rich_text?: NotionRichTextItem[];
  multi_select?: Array<{ name?: string | null }>;
  checkbox?: boolean;
  url?: string | null;
  number?: number | null;
};

const notionVersion = "2022-06-28";

function readPlainText(items: NotionRichTextItem[] = []) {
  return items.map((item) => item.plain_text ?? item.text?.content ?? "").join("").trim();
}

function readTitle(property?: NotionProperty) {
  return readPlainText(property?.title);
}

function readRichText(property?: NotionProperty) {
  return readPlainText(property?.rich_text);
}

function readRichTextSpans(property?: NotionProperty): RichTextSpan[] {
  return (property?.rich_text ?? [])
    .map((item) => ({
      text: item.plain_text ?? item.text?.content ?? "",
      href: item.href ?? item.text?.link?.url ?? undefined,
      bold: Boolean(item.annotations?.bold),
      italic: Boolean(item.annotations?.italic),
      underline: Boolean(item.annotations?.underline),
      strikethrough: Boolean(item.annotations?.strikethrough),
      code: Boolean(item.annotations?.code)
    }))
    .filter((span) => span.text.length > 0);
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

function readNumber(property?: NotionProperty) {
  return typeof property?.number === "number" ? property.number : 0;
}

function mapNotionPageToLink(page: NotionPage, index: number): UsefulLink | null {
  const properties = page.properties ?? {};
  const title = readTitle(properties.Name);
  const url = readUrl(properties.URL);
  const isPublished = readCheckbox(properties.Published);

  if (!title || !url || !isPublished) {
    return null;
  }

  const descriptionRichText = readRichTextSpans(properties.Description);
  const description = readRichText(properties.Description);
  const order = readNumber(properties.Order);
  const fallbackOrder = Date.parse(page.last_edited_time ?? page.created_time ?? "");

  return {
    id: `notion-link-${page.id.replace(/-/g, "")}`,
    title,
    description,
    descriptionRichText,
    url,
    tags: readMultiSelect(properties.Tags),
    status: "published",
    orderWeight: order || (Number.isNaN(fallbackOrder) ? 10_000 - index : fallbackOrder)
  };
}

export async function fetchPublishedNotionLinks({
  notionToken,
  databaseId,
  fetchImpl = fetch
}: FetchPublishedNotionLinksOptions = {}) {
  if (!notionToken) {
    throw new Error("Missing NOTION_TOKEN");
  }

  if (!databaseId) {
    throw new Error("Missing NOTION_LINKS_DATABASE_ID");
  }

  const links: UsefulLink[] = [];
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
            property: "Order",
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
      throw new Error(`Notion links request failed: ${response.status} ${errorText}`);
    }

    const payload = (await response.json()) as NotionQueryResponse;

    payload.results.forEach((page) => {
      const link = mapNotionPageToLink(page, pageIndex);

      if (link) {
        links.push(link);
        pageIndex += 1;
      }
    });

    nextCursor = payload.has_more ? payload.next_cursor : null;
  } while (nextCursor);

  return links.sort((a, b) => b.orderWeight - a.orderWeight);
}
