import { memo } from "react";
import { Link } from "react-router-dom";
import type { Category } from "@/shared/types/content";

type CategoryCardProps = {
  category: Category;
};

const categoryCoverBySlug: Record<string, string> = {
  lives: "/category-covers/head.png",
  lessons: "/category-covers/hand.png",
  podcasts: "/category-covers/microphone.png",
  library: "/category-covers/books.png"
};

// Keep a permanent reference to each preloaded cover so the browser never
// garbage-collects the decoded image. Without retaining these, the cards
// re-decode on every return to Home and flash the empty background.
const preloadedCovers = Object.values(categoryCoverBySlug).map((coverImage) => {
  const image = new Image();
  image.decoding = "sync";
  image.src = coverImage;
  return image;
});

if (typeof window !== "undefined") {
  (window as unknown as { __categoryCoverPreloads__?: HTMLImageElement[] }).__categoryCoverPreloads__ =
    preloadedCovers;
}

function CategoryCardComponent({ category }: CategoryCardProps) {
  const coverImage = categoryCoverBySlug[category.slug];

  return (
    <Link
      to={`/category/${category.slug}`}
      className="category-card surface-card relative flex flex-col justify-between overflow-hidden rounded-[15px] border-0 p-0"
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={category.title}
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          className="category-card-image absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="category-card-overlay absolute inset-0" />

      <div className="relative flex h-full flex-col justify-between px-[15px] pt-3 pb-[0.95rem]">
        <span className="self-start text-[14px] uppercase leading-none tracking-[0.2em] text-[#ffdeb7]">
          {String(category.order).padStart(2, "0")}
        </span>

        <div className="relative flex min-h-0 items-end overflow-visible">
          <span
            aria-hidden="true"
            className="category-card-title-glow pointer-events-none absolute -left-2 -right-3 bottom-[-0.15rem] h-10 rounded-full"
          />
          <h3 className="relative z-[1] whitespace-nowrap pr-10 font-serif text-[1.02rem] leading-[1.02]">
            {category.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
