import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-deep text-bg-base shadow-soft hover:bg-[var(--color-button-primary-hover)] active:bg-[var(--color-button-primary-active)]",
  secondary:
    "button-secondary-surface hover:bg-[var(--color-button-secondary-hover)] active:bg-[var(--color-button-secondary-active)]",
  ghost:
    "bg-transparent text-text-primary hover:bg-[var(--color-button-secondary-hover)] active:bg-[var(--color-button-secondary-active)]"
};

export function Button({
  variant = "primary",
  leftSlot,
  rightSlot,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "pressable inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-button px-4 py-2.5 text-[13px] font-semibold leading-none transition disabled:cursor-not-allowed disabled:bg-state-disabledBg disabled:text-state-disabledText",
        variantClasses[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {leftSlot}
      <span>{children}</span>
      {rightSlot}
    </button>
  );
}
