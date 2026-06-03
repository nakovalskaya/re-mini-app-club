/**
 * Image proxy — fetches an upstream image and pipes it back through our own
 * origin. This sidesteps mobile Telegram WebView's flakiness with
 * Tilda CDN (optim → static.tildacdn.com 302 redirect + WebP) which manifests
 * as silent broken-image icons on iOS while desktop loads them fine.
 *
 * Only whitelisted hosts are allowed so the endpoint cannot be turned into a
 * generic open proxy.
 */

const ALLOWED_HOSTS = new Set<string>([
  // Tilda CDN — the failing case in production.
  "optim.tildacdn.com",
  "static.tildacdn.com",
  // Hosts the user has used or is likely to use for material covers.
  "i.postimg.cc",
  "postimg.cc",
  "images.unsplash.com",
  "i.imgur.com",
  "imgur.com",
  "res.cloudinary.com"
]);

type ProxyRequest = { url?: string; method?: string; query?: Record<string, string | string[] | undefined> };
type ProxyResponse = {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string | Buffer): void;
};

function readUrlParam(request: ProxyRequest): string | null {
  // Vercel: req.query.url. Vite middleware: parse from request.url.
  const fromQuery = request.query?.url;
  if (typeof fromQuery === "string") {
    return fromQuery;
  }
  if (Array.isArray(fromQuery) && fromQuery.length > 0 && typeof fromQuery[0] === "string") {
    return fromQuery[0] ?? null;
  }
  if (request.url) {
    try {
      const parsed = new URL(request.url, "http://placeholder");
      return parsed.searchParams.get("url");
    } catch {
      return null;
    }
  }
  return null;
}

export async function handleImageProxy(
  request: ProxyRequest,
  response: ProxyResponse,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  if (request.method && request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const rawUrl = readUrlParam(request);
  if (!rawUrl) {
    response.statusCode = 400;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Missing url parameter" }));
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    response.statusCode = 400;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Invalid url" }));
    return;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    response.statusCode = 400;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Unsupported protocol" }));
    return;
  }

  const hostnameAllowed =
    ALLOWED_HOSTS.has(parsed.hostname) ||
    Array.from(ALLOWED_HOSTS).some((host) => parsed.hostname.endsWith(`.${host}`));

  if (!hostnameAllowed) {
    response.statusCode = 403;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "Host not allowed", host: parsed.hostname }));
    return;
  }

  try {
    // Follow redirects (Tilda does optim → static); we want the final bytes.
    const upstream = await fetchImpl(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        // A plain UA — Tilda sometimes returns different content for "weird" UAs.
        "User-Agent": "Mozilla/5.0 (compatible; ReakciaClubProxy/1.0)",
        Accept: "image/*,*/*;q=0.8"
      }
    });

    if (!upstream.ok) {
      response.statusCode = 502;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "Upstream failed", status: upstream.status }));
      return;
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await upstream.arrayBuffer());

    response.statusCode = 200;
    response.setHeader("Content-Type", contentType);
    // Cache aggressively at the CDN — image content doesn't change at a given URL.
    response.setHeader(
      "Cache-Control",
      "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800, immutable"
    );
    response.end(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.statusCode = 502;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: message }));
  }
}
