import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

type TopicPillProps = {
  label: string;
  to: string;
  isActive?: boolean;
};

export function TopicPill({ label, to, isActive = false }: TopicPillProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-4 text-sm font-normal transition-none",
        isActive
          ? "button-primary-accent border-transparent shadow-soft"
          : "border-border-soft bg-[var(--gradient-dark-surface)] text-text-primary"
      )}
    >
      {label}
    </Link>
  );
}
