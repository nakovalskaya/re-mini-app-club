import { useNavigate } from "react-router-dom";
import { IconButton } from "@/components/IconButton/IconButton";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <IconButton
      icon={<span className="text-base leading-none">←</span>}
      onClick={() => navigate(-1)}
      aria-label="Назад"
    />
  );
}
