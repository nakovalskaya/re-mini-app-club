import { memo } from "react";
import { Link } from "react-router-dom";
import type { Category } from "@/shared/types/content";

type CategoryCardProps = {
  category: Category;
};

const categoryCoverBySlug: Record<string, string> = {
  lives: "/category-covers/head.jpg",
  lessons: "/category-covers/hand.jpg",
  podcasts: "/category-covers/microphone.jpg",
  library: "/category-covers/books.jpg"
};

for (const coverImage of Object.values(categoryCoverBySlug)) {
  const image = new Image();
  image.src = coverImage;
}

function CategoryCardComponent({ category }: CategoryCardProps) {
  const coverImage = categoryCoverBySlug[category.slug];

  return (
    <Link
      to={`/category/${category.slug}`}
      className="category-card surface-card pressable relative flex flex-col justify-between overflow-hidden rounded-[15px] border-0 p-0"
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={category.title}
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="category-card-image absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="category-card-overlay absolute inset-0" />

      <div className="relative flex h-full flex-col justify-between px-[15px] pt-3 pb-4">
        <span className="self-start text-[14px] uppercase leading-none tracking-[0.2em] text-accent-gold">
          {String(category.order).padStart(2, "0")}
        </span>

        <div className="flex min-h-0 items-end">
          <h3 className="max-w-[7ch] font-serif text-[1.44rem] leading-[0.9] text-[#fff8f2]">
            {category.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export const CategoryCard = memo(CategoryCardComponent);
