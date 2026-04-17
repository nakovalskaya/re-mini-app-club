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

  return (
    <IconButton
      icon={<span className={cn("text-base", active && "text-[#8f5a00]")}>★</span>}
      isActive={active}
      className={cn(
        "h-10 w-10 rounded-full border-border-soft bg-[rgba(255,248,247,0.92)] shadow-soft backdrop-blur",
        active && "border-[#f0cf8e] bg-[#fff2dc]",
        className
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(materialId);
      }}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
    />
  );
}
