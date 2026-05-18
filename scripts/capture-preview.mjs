import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, "dist");
const outputDir = path.join(workspaceRoot, "preview");
const outputPath = path.join(outputDir, "home.png");
const host = "127.0.0.1";
const port = 4173;
const chromePath =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

async function ensureDirExists(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readFileFromDist(requestPathname) {
  const normalizedPath = requestPathname === "/" ? "/index.html" : requestPathname;
  const targetPath = path.normalize(path.join(distDir, normalizedPath));

  if (!targetPath.startsWith(distDir)) {
    throw new Error("Blocked path traversal outside dist.");
  }

  try {
    const stat = await fs.stat(targetPath);

    if (stat.isDirectory()) {
      return {
        body: await fs.readFile(path.join(targetPath, "index.html")),
        filePath: path.join(targetPath, "index.html")
      };
    }

    return {
      body: await fs.readFile(targetPath),
      filePath: targetPath
    };
  } catch {
    return {
      body: await fs.readFile(path.join(distDir, "index.html")),
      filePath: path.join(distDir, "index.html")
    };
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
      const { body, filePath } = await readFileFromDist(requestUrl.pathname);
      const extension = path.extname(filePath);

      response.statusCode = 200;
      response.setHeader(
        "Content-Type",
        contentTypes.get(extension) ?? "application/octet-stream"
      );
      response.end(body);
    } catch (error) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end(error instanceof Error ? error.message : "Unknown server error");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });

  return server;
}

async function captureScreenshot(url) {
  await new Promise((resolve, reject) => {
    const chrome = spawn(
      chromePath,
      [
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--force-device-scale-factor=2",
        "--window-size=430,932",
        "--virtual-time-budget=8000",
        `--screenshot=${outputPath}`,
        url
      ],
      {
        stdio: "pipe"
      }
    );

    let stderr = "";

    chrome.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    chrome.on("error", reject);
    chrome.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `Chrome exited with code ${code}`));
    });
  });
}

async function main() {
  if (!(await fileExists(distDir))) {
    throw new Error("dist not found. Run `npm run build` first.");
  }

  await ensureDirExists(outputDir);
  const server = await startStaticServer();

  try {
    await captureScreenshot(`http://${host}:${port}/`);
    process.stdout.write(`${outputPath}\n`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

await main();
