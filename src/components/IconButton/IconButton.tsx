import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  isActive?: boolean;
};

export function IconButton({
  icon,
  isActive = false,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        "pressable inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-icon-button)] border text-text-primary transition",
        isActive
          ? "button-secondary-icon shadow-soft"
          : "button-secondary-icon",
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
