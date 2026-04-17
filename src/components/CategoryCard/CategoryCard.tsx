import { Link } from "react-router-dom";
import type { Category } from "@/shared/types/content";

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="surface-card pressable flex min-h-[150px] flex-col justify-between p-4"
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] uppercase tracking-[0.24em] text-text-secondary">
          {String(category.order).padStart(2, "0")}
        </span>
        <span className="rounded-full border border-border-soft bg-bg-soft px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
          {category.slug}
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="font-serif text-[1.8rem] leading-none text-text-primary">
          {category.title}
        </h3>
        <p className="max-w-[18ch] text-sm leading-6 text-text-secondary">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
