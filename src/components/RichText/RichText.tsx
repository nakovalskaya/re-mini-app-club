import type { RichTextSpan } from "@/shared/types/content";
import { cn } from "@/shared/utils/cn";

type RichTextProps = {
  spans: RichTextSpan[];
  fallback?: string;
  className?: string;
};

export function RichText({ spans, fallback = "", className }: RichTextProps) {
  const visibleSpans = spans.length > 0 ? spans : fallback ? [{ text: fallback }] : [];

  if (visibleSpans.length === 0) {
    return null;
  }

  return (
    <p className={cn("type-body whitespace-pre-line", className)}>
      {visibleSpans.map((span, index) => {
        const content = (
          <span
            className={cn(
              span.bold && "font-medium text-text-primary",
              span.italic && "italic",
              span.underline && "underline underline-offset-2",
              span.strikethrough && "line-through",
              span.code && "rounded-md bg-[rgba(255,239,220,0.08)] px-1 py-0.5 text-[0.78rem]"
            )}
          >
            {span.text}
          </span>
        );

        if (span.href) {
          return (
            <a
              key={`${span.text}-${index}`}
              href={span.href}
              target="_blank"
              rel="noreferrer"
              className="text-text-primary underline decoration-[rgba(255,239,220,0.32)] underline-offset-4"
            >
              {content}
            </a>
          );
        }

        return <span key={`${span.text}-${index}`}>{content}</span>;
      })}
    </p>
  );
}
