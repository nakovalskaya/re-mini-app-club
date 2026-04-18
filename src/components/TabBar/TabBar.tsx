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
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      >
        <defs>
          <filter
            id="tabbar-liquid-distortion"
            x="-20%"
            y="-40%"
            width="140%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.03"
              numOctaves="2"
              seed="14"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md justify-center px-4">
      <div className="tabbar-glass relative flex w-full items-center justify-between overflow-hidden rounded-[24px] px-2.5 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "tabbar-item pressable relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-1.5 text-[11px] font-medium text-text-secondary",
                isActive && "tabbar-item-active text-accent-deep"
              )
            }
          >
            <span className="tabbar-icon text-[15px] leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      </nav>
    </>
  );
}
