import { Book, HouseSimple, Star, Target } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

type TabItem = {
  label: string;
  to: string;
  icon: "house" | "target" | "star" | "book";
};

type TabBarProps = {
  items: readonly TabItem[];
};

const iconMap = {
  house: HouseSimple,
  target: Target,
  star: Star,
  book: Book
} as const;

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
          (() => {
            const Icon = iconMap[item.icon];

            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    "tabbar-item pressable relative flex min-w-0 flex-1 items-center justify-center px-2 py-1.5 text-text-secondary",
                    isActive && "tabbar-item-active text-accent-deep"
                  )
                }
              >
                <span className="tabbar-icon flex h-7 w-7 items-center justify-center">
                  <Icon size={27} weight="regular" />
                </span>
              </NavLink>
            );
          })()
        ))}
      </div>
      </nav>
    </>
  );
}
