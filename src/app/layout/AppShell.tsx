import { useEffect, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { DevDebugPanel } from "@/components/DevDebugPanel/DevDebugPanel";
import { TabBar } from "@/components/TabBar/TabBar";
import { initTelegramWebApp } from "@/features/telegram/telegram";
import { useAppState } from "@/app/providers/AppStateProvider";
import { tabBarItems } from "@/shared/constants/routes";
import { cn } from "@/shared/utils/cn";

initTelegramWebApp();

const isDebug =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_ENABLE_DEBUG === "true") ||
  (typeof window !== "undefined" && window.location.search.includes("debug=true"));

declare global {
  interface Window {
    __MINI_APP_SCROLL_DEBUG__?: {
      routeKey?: string;
      navigationType?: string;
      container?: string;
      savedScrollTop?: number;
      appliedScrollTop?: number;
      currentScrollTop?: number;
      events?: Array<{
        type: "save" | "apply";
        routeKey: string;
        navigationType?: string;
        scrollTop: number;
        container: string;
        at: string;
      }>;
    };
  }
}

function debugScrollRestore(update: NonNullable<Window["__MINI_APP_SCROLL_DEBUG__"]>) {
  if (typeof window === "undefined") {
    return;
  }

  window.__MINI_APP_SCROLL_DEBUG__ = update;

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.info("[mini-app-scroll-restore]", update);
  }
}

export function AppShell() {
  return <ShellContent />;
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
  const routeScrollKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      scrollPositionsRef.current.set(routeScrollKey, element.scrollTop);
      debugScrollRestore({
        routeKey: routeScrollKey,
        navigationType,
        container: "main.screen-content",
        savedScrollTop: element.scrollTop,
        appliedScrollTop: window.__MINI_APP_SCROLL_DEBUG__?.appliedScrollTop ?? 0,
        currentScrollTop: element.scrollTop,
        events: [
          ...(window.__MINI_APP_SCROLL_DEBUG__?.events ?? []).slice(-9),
          {
            type: "save",
            routeKey: routeScrollKey,
            navigationType,
            scrollTop: element.scrollTop,
            container: "main.screen-content",
            at: new Date().toISOString()
          }
        ]
      });
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [navigationType, routeScrollKey]);

  useLayoutEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return;
    }

    const nextTop =
      navigationType === "POP" ? (scrollPositionsRef.current.get(routeScrollKey) ?? 0) : 0;

    const applyScroll = () => {
      element.scrollTo({ top: nextTop, left: 0, behavior: "auto" });
      debugScrollRestore({
        routeKey: routeScrollKey,
        navigationType,
        container: "main.screen-content",
        savedScrollTop: scrollPositionsRef.current.get(routeScrollKey) ?? 0,
        appliedScrollTop: nextTop,
        currentScrollTop: element.scrollTop,
        events: [
          ...(window.__MINI_APP_SCROLL_DEBUG__?.events ?? []).slice(-9),
          {
            type: "apply",
            routeKey: routeScrollKey,
            navigationType,
            scrollTop: nextTop,
            container: "main.screen-content",
            at: new Date().toISOString()
          }
        ]
      });
    };

    applyScroll();
  }, [navigationType, routeScrollKey]);

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
