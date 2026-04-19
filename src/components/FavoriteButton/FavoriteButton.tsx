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
            active && "text-[#c27a00] drop-shadow-[0_0_10px_rgba(255,208,148,0.55)]",
            (active || isAnimating) && "scale-[1.12]"
          )}
        >
          ★
        </span>
      }
      isActive={active}
      className={cn(
        "favorite-button h-10 w-10 rounded-full border-border-soft bg-[rgba(255,248,247,0.92)] shadow-soft backdrop-blur",
        active && "border-[#f3cf8b] bg-[#fff5df] shadow-[0_10px_24px_rgba(194,122,0,0.16)]",
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
