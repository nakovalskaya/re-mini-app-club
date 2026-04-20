import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fetchPublishedNotionMaterials } from "./server/notionMaterials";

function notionMaterialsDevApi(): Plugin {
  return {
    name: "notion-materials-dev-api",
    configureServer(server) {
      const handler = async (request: any, response: any, next?: () => void) => {
        const requestUrl = request.url?.split("?")[0] ?? "";

        if (requestUrl !== "/__api/notion-materials") {
          next?.();
          return;
        }

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

      server.middlewares.stack.unshift({
        route: "",
        handle: handler
      } as never);
    }
  };
}

export default defineConfig({
  plugins: [react(), notionMaterialsDevApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
