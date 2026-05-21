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
