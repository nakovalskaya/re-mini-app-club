import type { ReactNode } from "react";
import { AtomIcon } from "@/components/AtomIcon/AtomIcon";
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
      <div className="mx-auto flex h-12 w-12 items-center justify-center">
        {icon ?? <AtomIcon className="h-11 w-11" />}
      </div>
      <div className="space-y-2">
        <h3 className="text-[1.28rem] font-medium leading-[1.15] text-text-primary">{title}</h3>
        <p className="type-body">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
