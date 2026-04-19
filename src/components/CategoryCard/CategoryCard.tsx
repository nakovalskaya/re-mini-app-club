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
      className="surface-card pressable relative flex aspect-[1.22/1] min-h-[134px] flex-col justify-between overflow-hidden border-0 p-0"
      style={
        coverImage
          ? {
              backgroundImage: `linear-gradient(180deg, rgba(39,8,8,0.18) 0%, rgba(39,8,8,0.08) 34%, rgba(21,5,5,0.58) 100%), url(${coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_32%),linear-gradient(180deg,transparent_0%,rgba(26,6,6,0.14)_52%,rgba(26,6,6,0.38)_100%)]" />

      <div className="relative flex h-full flex-col justify-between p-[15px]">
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-[0.24em] text-[#fff4ef]">
            {String(category.order).padStart(2, "0")}
          </span>
          <h3 className="max-w-[7ch] font-serif text-[1.5rem] leading-[0.93] text-[#fff8f2]">
            {category.title}
          </h3>
        </div>

        <p className="max-w-[15ch] text-[13px] leading-[1.3] text-[rgba(255,248,242,0.88)]">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
