import { NavLink } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

type TabItem = {
  label: string;
  to: string;
  icon: string;
};

type TabBarProps = {
  items: readonly TabItem[];
};

export function TabBar({ items }: TabBarProps) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md justify-center px-4">
      <div className="flex w-full items-center justify-between rounded-[26px] border border-border-soft bg-[rgba(255,248,247,0.92)] px-3 py-3 shadow-floating backdrop-blur">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "pressable flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-xs font-medium text-text-secondary",
                isActive && "bg-bg-soft text-accent-deep"
              )
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
