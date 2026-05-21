import { fetchPublishedNotionChallenges } from "../server/notionChallenges.js";

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
    const challenges = await fetchPublishedNotionChallenges({
      notionToken: process?.env?.NOTION_TOKEN,
      challengesDatabaseId: process?.env?.NOTION_CHALLENGES_DATABASE_ID,
      challengeDaysDatabaseId: process?.env?.NOTION_CHALLENGE_DAYS_DATABASE_ID
    });

    response.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.statusCode = 200;
    response.end(JSON.stringify({ source: "notion", challenges }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: message }));
  }
}
