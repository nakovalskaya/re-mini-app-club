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
    "bg-accent-deep text-bg-base shadow-soft hover:bg-[#4f0202] active:bg-[#480202]",
  secondary:
    "border border-border-medium bg-bg-surface text-text-primary hover:bg-bg-soft active:bg-[#f1e6e5]",
  ghost: "bg-transparent text-text-primary hover:bg-bg-soft active:bg-[#f1e6e5]"
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
        "pressable inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-button px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-state-disabledBg disabled:text-state-disabledText",
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
