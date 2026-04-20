import { fetchPublishedNotionMaterials } from "../server/notionMaterials";

export default async function handler(request: { method?: string }, response: any) {
  if (request.method && request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const materials = await fetchPublishedNotionMaterials({
      notionToken: process.env.NOTION_TOKEN,
      databaseId: process.env.NOTION_DATABASE_ID ?? process.env.DATABASE_ID
    });

    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.status(200).json({
      source: "notion",
      materials
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    response.status(500).json({
      error: message
    });
  }
}
