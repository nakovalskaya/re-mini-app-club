import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type SectionTitleProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  serif?: boolean;
  eyebrow?: string;
  className?: string;
};

export function SectionTitle({
  title,
  description,
  action,
  serif = true,
  eyebrow,
  className
}: SectionTitleProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="type-page-eyebrow">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-text-primary",
            serif
              ? "font-serif type-page-title"
              : "text-[1.06rem] font-semibold leading-tight"
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="type-page-description">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
