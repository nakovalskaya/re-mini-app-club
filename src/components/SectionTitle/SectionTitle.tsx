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
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-text-primary",
            serif ? "font-serif text-[2rem] leading-none" : "text-xl font-semibold"
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-[34ch] text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
