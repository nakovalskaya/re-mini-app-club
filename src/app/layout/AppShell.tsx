import { useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { DevDebugPanel } from "@/components/DevDebugPanel/DevDebugPanel";
import { TabBar } from "@/components/TabBar/TabBar";
import { initTelegramWebApp } from "@/features/telegram/telegram";
import { AppStateProvider, useAppState } from "@/app/providers/AppStateProvider";
import { tabBarItems } from "@/shared/constants/routes";
import { cn } from "@/shared/utils/cn";

initTelegramWebApp();

const isDebug =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_ENABLE_DEBUG === "true") ||
  (typeof window !== "undefined" && window.location.search.includes("debug=true"));

export function AppShell() {
  return (
    <AppStateProvider>
      <ShellContent />
    </AppStateProvider>
  );
}

function ShellContent() {
  const contentRef = useRef<HTMLElement | null>(null);
  const scrollPositionsRef = useRef<Map<string, number>>(new Map());
  const location = useLocation();
  const navigationType = useNavigationType();
  const {
    challengeConfirmationDialog,
    confirmChallengeDialog,
    dismissChallengeDialog
  } = useAppState();
  const shouldShowTabBar = tabBarItems.some((item) => item.to === location.pathname);

  useEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      scrollPositionsRef.current.set(location.key, element.scrollTop);
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
      scrollPositionsRef.current.set(location.key, element.scrollTop);
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return;
    }

    const nextTop =
      navigationType === "POP" ? (scrollPositionsRef.current.get(location.key) ?? 0) : 0;

    element.scrollTo({ top: nextTop, left: 0, behavior: "auto" });
  }, [location.key, navigationType]);

  return (
    <div className="screen-shell safe-top">
      <main
        ref={contentRef}
        className={cn("screen-content", !shouldShowTabBar && "pb-8")}
      >
        <Outlet />
      </main>
      {isDebug ? <DevDebugPanel /> : null}
      {shouldShowTabBar ? <TabBar items={tabBarItems} /> : null}

      {challengeConfirmationDialog ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(40,24,20,0.38)] px-4 py-6">
          <div className="surface-card w-full max-w-[21.5rem] space-y-4 rounded-[22px] p-5 font-montserrat shadow-floating">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Подтверждение
              </p>
              <h3 className="font-montserrat text-[1.5rem] font-semibold leading-[1.02] text-text-primary">
                {challengeConfirmationDialog.title}
              </h3>
              <p className="text-[13px] leading-5 text-text-secondary">
                {challengeConfirmationDialog.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="min-h-11 font-montserrat text-[13px]"
                onClick={dismissChallengeDialog}
              >
                {challengeConfirmationDialog.cancelLabel}
              </Button>
              <Button
                className="min-h-11 font-montserrat text-[13px]"
                onClick={confirmChallengeDialog}
              >
                {challengeConfirmationDialog.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
