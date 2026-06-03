/**
 * Hosts whose images need to be served through our own origin to load reliably
 * on mobile Telegram WebView. Tilda CDN is the known-broken case (silent
 * broken-image icons on iOS while desktop works); the others are added
 * defensively so future image hosts get the same treatment.
 */
const PROXIED_IMAGE_HOSTS = ["tildacdn.com"];

/**
 * Rewrite an upstream image URL to go through `/api/img`. The serverless
 * function fetches the bytes from the original host and pipes them back to the
 * client as a same-origin response, which sidesteps the iOS WebView issue
 * where Tilda's optim → static redirect + WebP combination renders as a
 * broken-image icon on mobile while loading fine on desktop.
 *
 * In dev (Vite) the endpoint is exposed at `/__api/img`; in prod (Vercel) it's
 * at `/api/img`. Both delegate to the same handler in `server/imageProxy.ts`.
 */
function proxiedImageUrl(src: string): string {
  const endpoint =
    typeof import.meta !== "undefined" && import.meta.env?.DEV
      ? "/__api/img"
      : "/api/img";
  return `${endpoint}?url=${encodeURIComponent(src)}`;
}

function shouldProxyHost(hostname: string): boolean {
  return PROXIED_IMAGE_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  );
}

export function getOptimizedImageUrl(
  src: string,
  {
    width,
    quality = 70
  }: {
    width: number;
    quality?: number;
  }
) {
  try {
    const url = new URL(src);

    if (shouldProxyHost(url.hostname)) {
      return proxiedImageUrl(src);
    }

    if (!url.hostname.includes("images.unsplash.com")) {
      return src;
    }

    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality));
    url.searchParams.set("dpr", "1");

    return url.toString();
  } catch {
    return src;
  }
}

export const COVER_IMAGE_WIDTH = 900;
export const COVER_IMAGE_QUALITY = 70;

/**
 * Single canonical URL for a material cover, used by cards, the detail screen
 * and the preloader alike — so the browser cache reliably hits.
 */
export function getCoverImageUrl(src: string) {
  return getOptimizedImageUrl(src, {
    width: COVER_IMAGE_WIDTH,
    quality: COVER_IMAGE_QUALITY
  });
}

export function getImageSrcSet(
  src: string,
  widths: readonly number[],
  quality = 70
) {
  return widths
    .map((width) => `${getOptimizedImageUrl(src, { width, quality })} ${width}w`)
    .join(", ");
}
