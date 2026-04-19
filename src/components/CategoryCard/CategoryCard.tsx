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
  const prioritizeImage = category.order <= 2;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="category-card surface-card pressable relative flex flex-col justify-between overflow-hidden border-0 p-0"
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt={category.title}
          width={1920}
          height={1080}
          loading={prioritizeImage ? "eager" : "lazy"}
          fetchPriority={prioritizeImage ? "high" : "auto"}
          decoding="async"
          className="category-card-image absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="category-card-overlay absolute inset-0" />

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
