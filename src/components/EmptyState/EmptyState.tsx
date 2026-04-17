import type { ReactNode } from "react";
import { Button } from "@/components/Button/Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon
}: EmptyStateProps) {
  return (
    <div className="surface-card space-y-4 p-card text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg-soft text-accent-deep">
        {icon ?? <span className="text-lg">✦</span>}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="text-sm leading-6 text-text-secondary">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
