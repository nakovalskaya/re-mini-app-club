import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { AtomLoader } from "@/components/LoadingScreen/LoadingScreen";
import { cn } from "@/shared/utils/cn";

type CoverImageProps = ImgHTMLAttributes<HTMLImageElement>;

/** Remembers which image URLs have already finished loading this session. */
const loadedImageSrcs = new Set<string>();

export function markImageLoaded(src?: string | null) {
  if (src) {
    loadedImageSrcs.add(src);
  }
}

export function isImageLoaded(src?: string | null) {
  return Boolean(src) && loadedImageSrcs.has(src as string);
}

/**
 * Cover image with a shimmering skeleton shown while it loads.
 *
 * The <img> itself is always fully visible (never hidden), so it can never get
 * "stuck invisible". The skeleton sits *on top* of the image and fades out once the
 * image is ready, so the photo is revealed with a soft cross-fade instead of a hard
 * pop. If load detection ever failed, the worst case is a brief covered frame — but
 * the robust complete/decode/onLoad checks below make that effectively impossible.
 */
export function CoverImage({ className, onLoad, ...props }: CoverImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  // Already-seen / preloaded images start "loaded" → no skeleton, instant show.
  const [loaded, setLoaded] = useState(() => isImageLoaded(props.src as string));

  useEffect(() => {
    const img = ref.current;
    if (!img) {
      return;
    }

    let cancelled = false;
    const markLoaded = () => {
      markImageLoaded(props.src as string);
      if (!cancelled) {
        setLoaded(true);
      }
    };

    if (img.complete) {
      markLoaded();
      return;
    }

    if (typeof img.decode === "function") {
      img.decode().then(markLoaded).catch(markLoaded);
    }

    return () => {
      cancelled = true;
    };
  }, [props.src, props.srcSet]);

  return (
    <>
      <img
        ref={ref}
        {...props}
        onLoad={(event) => {
          markImageLoaded(props.src as string);
          setLoaded(true);
          onLoad?.(event);
        }}
        className={className}
      />
      <div aria-hidden="true" className={cn("image-skeleton", loaded && "image-skeleton-hidden")}>
        <div className="image-skeleton-loader">
          <AtomLoader variant="mini" />
        </div>
      </div>
    </>
  );
}
