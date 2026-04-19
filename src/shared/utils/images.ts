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

export function getImageSrcSet(
  src: string,
  widths: readonly number[],
  quality = 70
) {
  return widths
    .map((width) => `${getOptimizedImageUrl(src, { width, quality })} ${width}w`)
    .join(", ");
}
