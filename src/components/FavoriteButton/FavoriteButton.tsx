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
            "text-base transition-all duration-200",
            active && "favorite-star-active",
            (active || isAnimating) && "scale-[1.12]"
          )}
        >
          ★
        </span>
      }
      isActive={active}
      className={cn(
        "favorite-button favorite-button-shell h-10 w-10 rounded-full border-border-soft shadow-soft backdrop-blur",
        active && "favorite-button-active border-[#f3cf8b]",
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
