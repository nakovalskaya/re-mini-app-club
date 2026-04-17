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
        "pressable inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium",
        isActive
          ? "border-accent-deep bg-accent-deep text-bg-base shadow-soft"
          : "border-border-soft bg-bg-surface text-text-primary"
      )}
    >
      {label}
    </Link>
  );
}
