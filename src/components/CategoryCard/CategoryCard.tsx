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

export function CategoryCard({ category }: CategoryCardProps) {
  const coverImage = categoryCoverBySlug[category.slug];

  return (
    <Link
      to={`/category/${category.slug}`}
      className="surface-card pressable relative flex aspect-[16/9] min-h-[108px] flex-col justify-between overflow-hidden border-0 p-0"
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={category.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(26,6,6,0.03)_0%,rgba(26,6,6,0.02)_42%,rgba(26,6,6,0.05)_100%)]" />

      <div className="relative grid h-full grid-rows-[auto_1fr_auto] px-[15px] pt-3 pb-3.5">
        <span className="self-start text-[10px] uppercase leading-none tracking-[0.24em] text-[#fff4ef]">
          {String(category.order).padStart(2, "0")}
        </span>

        <div className="mt-1.5 flex min-h-0 items-start">
          <h3 className="max-w-[7ch] font-serif text-[1.38rem] leading-[0.92] text-[#fff8f2]">
            {category.title}
          </h3>
        </div>

        <p className="max-w-[16ch] self-end whitespace-pre-line text-[12.5px] leading-[1.34] text-[rgba(255,248,242,0.9)]">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
