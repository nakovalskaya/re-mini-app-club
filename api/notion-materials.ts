import { fetchPublishedNotionMaterials } from "../server/notionMaterials.js";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

export default async function handler(request: { method?: string }, response: any) {
  if (request.method && request.method !== "GET") {
    response.statusCode = 405;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const materials = await fetchPublishedNotionMaterials({
      notionToken: process?.env?.NOTION_TOKEN,
      databaseId: process?.env?.NOTION_DATABASE_ID ?? process?.env?.DATABASE_ID
    });

    response.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = 200;
    response.end(JSON.stringify({ source: "notion", materials }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: message }));
  }
}
