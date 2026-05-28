import { fetchPublishedNotionLinks } from "../server/notionLinks.js";

export default async function handler(request: any, response: any) {
  if (request.method !== "GET") {
    response.statusCode = 405;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const links = await fetchPublishedNotionLinks({
      notionToken: process?.env?.NOTION_TOKEN,
      databaseId: process?.env?.NOTION_LINKS_DATABASE_ID
    });

    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    response.end(JSON.stringify({ source: "notion", links }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: message }));
  }
}
