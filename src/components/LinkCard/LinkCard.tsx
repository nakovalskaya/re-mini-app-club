import { Button } from "@/components/Button/Button";
import { RichText } from "@/components/RichText/RichText";
import { openExternalLink } from "@/features/telegram/telegram";
import type { UsefulLink } from "@/shared/types/content";

type LinkCardProps = {
  link: UsefulLink;
};

export function LinkCard({ link }: LinkCardProps) {
  return (
    <article className="surface-card space-y-4 p-card">
      <div className="space-y-2">
        {link.tags.length > 0 ? (
          <div className="type-meta flex flex-wrap gap-2">
            {link.tags.map((tag) => (
              <span key={`${link.id}-${tag}`}>{tag}</span>
            ))}
          </div>
        ) : null}
        <h3 className="font-serif text-[1.22rem] leading-[1] text-text-primary">
          {link.title}
        </h3>
        <RichText spans={link.descriptionRichText} fallback={link.description} />
      </div>
      <Button
        onClick={() => {
          openExternalLink(link.url);
        }}
      >
        Открыть
      </Button>
    </article>
  );
}
