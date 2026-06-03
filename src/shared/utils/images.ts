/**
 * Tilda CDN serves images through `optim.tildacdn.com/.../-/format/webp/X.png.webp`,
 * which 302-redirects to `static.tildacdn.com/.../X.png`. iOS Telegram WebView
 * frequently stalls on that redirect + WebP combo when the image is loaded via
 * lazy `<img>`, leaving the user with a broken-image icon while desktop works
 * fine. Rewrite the URL to the static origin so the browser gets the original
 * PNG/JPG with a single hop.
 */
function rewriteTildaUrl(src: string): string {
  try {
    const url = new URL(src);
    if (!url.hostname.endsWith("tildacdn.com")) {
      return src;
    }

    // Drop the `/-/format/webp/` transformation segment and the `.webp` suffix.
    const pathname = url.pathname
      .replace(/\/-\/format\/[^/]+\//, "/")
      .replace(/\.webp$/i, "");

    return `https://static.tildacdn.com${pathname}`;
  } catch {
    return src;
  }
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

    if (url.hostname.endsWith("tildacdn.com")) {
      return rewriteTildaUrl(src);
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
