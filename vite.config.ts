import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fetchPublishedNotionMaterials } from "./server/notionMaterials";
import { fetchPublishedNotionChallenges } from "./server/notionChallenges";
import { fetchPublishedNotionLinks } from "./server/notionLinks";
import { handleImageProxy } from "./server/imageProxy";

function notionMaterialsDevApi(): Plugin {
  return {
    name: "notion-materials-dev-api",
    configureServer(server) {
      const handler = async (request: any, response: any) => {
        if (request.method !== "GET") {
          response.statusCode = 405;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const env = loadEnv(server.config.mode, process.cwd(), "");

        try {
          const materials = await fetchPublishedNotionMaterials({
            notionToken: env.NOTION_TOKEN,
            databaseId: env.NOTION_DATABASE_ID ?? env.DATABASE_ID
          });

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.setHeader("Cache-Control", "no-store, max-age=0");
          response.end(
            JSON.stringify({
              source: "notion",
              materials
            })
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";

          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: message }));
        }
      };

      server.middlewares.use("/__api/notion-materials", handler);
    }
  };
}

function notionChallengesDevApi(): Plugin {
  return {
    name: "notion-challenges-dev-api",
    configureServer(server) {
      const handler = async (request: any, response: any) => {
        if (request.method !== "GET") {
          response.statusCode = 405;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const env = loadEnv(server.config.mode, process.cwd(), "");

        try {
          const challenges = await fetchPublishedNotionChallenges({
            notionToken: env.NOTION_TOKEN,
            challengesDatabaseId: env.NOTION_CHALLENGES_DATABASE_ID,
            challengeDaysDatabaseId: env.NOTION_CHALLENGE_DAYS_DATABASE_ID
          });

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.setHeader("Cache-Control", "no-store, max-age=0");
          response.end(
            JSON.stringify({
              source: "notion",
              challenges
            })
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";

          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: message }));
        }
      };

      server.middlewares.use("/__api/notion-challenges", handler);
    }
  };
}

function notionLinksDevApi(): Plugin {
  return {
    name: "notion-links-dev-api",
    configureServer(server) {
      const handler = async (request: any, response: any) => {
        if (request.method !== "GET") {
          response.statusCode = 405;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const env = loadEnv(server.config.mode, process.cwd(), "");

        try {
          const links = await fetchPublishedNotionLinks({
            notionToken: env.NOTION_TOKEN,
            databaseId: env.NOTION_LINKS_DATABASE_ID
          });

          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.setHeader("Cache-Control", "no-store, max-age=0");
          response.end(
            JSON.stringify({
              source: "notion",
              links
            })
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";

          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: message }));
        }
      };

      server.middlewares.use("/__api/notion-links", handler);
    }
  };
}

function imageProxyDevApi(): Plugin {
  return {
    name: "image-proxy-dev-api",
    configureServer(server) {
      server.middlewares.use("/__api/img", async (request: any, response: any) => {
        await handleImageProxy(request, response);
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    notionMaterialsDevApi(),
    notionChallengesDevApi(),
    notionLinksDevApi(),
    imageProxyDevApi()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    // Bind to all addresses so both ::1 (browsers' default for `localhost`)
    // and 127.0.0.1 reach the same Vite instance. Without this the dev
    // server can end up IPv6-only when another process briefly held the port.
    host: true,
    port: 5173,
    strictPort: true
  }
});
