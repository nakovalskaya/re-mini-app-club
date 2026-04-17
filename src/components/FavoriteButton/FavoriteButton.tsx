import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/IconButton/IconButton";
import { useAppState } from "@/app/providers/AppStateProvider";
import { cn } from "@/shared/utils/cn";

type FavoriteButtonProps = {
  materialId: string;
  className?: string;
};

export function FavoriteButton({ materialId, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useAppState();
  const active = isFavorite(materialId);
  const previousActive = useRef(active);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (previousActive.current !== active) {
      setIsAnimating(true);
      const timeoutId = window.setTimeout(() => setIsAnimating(false), 260);
      previousActive.current = active;

      return () => window.clearTimeout(timeoutId);
    }

    previousActive.current = active;
    return undefined;
  }, [active]);

  return (
    <IconButton
      icon={
        <span
          className={cn(
            "text-base transition-transform duration-200",
            active && "text-[#8f5a00]",
            isAnimating && "scale-[1.14]"
          )}
        >
          ★
        </span>
      }
      isActive={active}
      className={cn(
        "favorite-button h-10 w-10 rounded-full border-border-soft bg-[rgba(255,248,247,0.92)] shadow-soft backdrop-blur",
        active && "border-[#f0cf8e] bg-[#fff2dc]",
        isAnimating && "favorite-button-animate",
        className
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(materialId);
      }}
      aria-pressed={active}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
    />
  );
}
