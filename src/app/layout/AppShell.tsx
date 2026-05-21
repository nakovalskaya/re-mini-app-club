import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { Button } from "@/components/Button/Button";
import { markImageLoaded } from "@/components/CoverImage/CoverImage";
import { DevDebugPanel } from "@/components/DevDebugPanel/DevDebugPanel";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { TabBar } from "@/components/TabBar/TabBar";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { useMaterials } from "@/app/providers/MaterialsProvider";
import {
  applyTelegramThemeToDocument,
  initTelegramWebApp,
  subscribeToTelegramThemeChanges
} from "@/features/telegram/telegram";
import { useAppState } from "@/app/providers/AppStateProvider";
import { tabBarItems } from "@/shared/constants/routes";
import { cn } from "@/shared/utils/cn";
import { getCoverImageUrl } from "@/shared/utils/images";

initTelegramWebApp();
applyTelegramThemeToDocument();

const CATEGORY_COVER_URLS = [
  "/category-covers/head.png",
  "/category-covers/hand.png",
  "/category-covers/microphone.png",
  "/category-covers/books.png"
];

const isDebug =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_ENABLE_DEBUG === "true";

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
  const { isLoading: materialsLoading, materials } = useMaterials();
  const [booting, setBooting] = useState(true);
  const [bootFadingOut, setBootFadingOut] = useState(false);
  const bootStartRef = useRef(Date.now());

  useEffect(() => {
    if (!booting || materialsLoading) {
      return;
    }

    let cancelled = false;
    const MIN_VISIBLE_MS = 900;
    const FADE_MS = 400;
    const MAX_PRELOAD_MS = 2200;

    const imageUrls = [
      ...CATEGORY_COVER_URLS,
      ...materials
        .map((material) => (material.coverImage ? getCoverImageUrl(material.coverImage) : null))
        .filter((url): url is string => Boolean(url))
    ];

    const preloadImages = new Promise<void>((resolve) => {
      let remaining = imageUrls.length;
      if (remaining === 0) {
        resolve();
        return;
      }

      const settle = (url: string) => {
        markImageLoaded(url);
        remaining -= 1;
        if (remaining <= 0) {
          resolve();
        }
      };

      imageUrls.forEach((url) => {
        const image = new Image();
        image.onload = () => settle(url);
        image.onerror = () => settle(url);
        image.src = url;
      });
    });

    const safetyTimeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MAX_PRELOAD_MS);
    });

    let hideTimer = 0;
    let fadeTimer = 0;

    void Promise.race([preloadImages, safetyTimeout]).then(() => {
      if (cancelled) {
        return;
      }

      const elapsed = Date.now() - bootStartRef.current;
      const waitBeforeFade = Math.max(0, MIN_VISIBLE_MS - elapsed);

      hideTimer = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        setBootFadingOut(true);
        fadeTimer = window.setTimeout(() => {
          if (!cancelled) {
            setBooting(false);
          }
        }, FADE_MS);
      }, waitBeforeFade);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(hideTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [booting, materialsLoading, materials]);

  const isHome = location.pathname === "/";
  const shouldShowTabBar = tabBarItems.some((item) => item.to === location.pathname);
  const shouldApplyTopInset = location.pathname !== "/";
  const routeScrollKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    const unsubscribe = subscribeToTelegramThemeChanges(() => undefined);

    return () => {
      unsubscribe();
    };
  }, []);

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
    <div className="screen-shell">
      {booting ? <LoadingScreen variant="boot" fadingOut={bootFadingOut} /> : null}
      <main
        ref={contentRef}
        className={cn(
          "screen-content",
          shouldApplyTopInset && "safe-top pt-3",
          !shouldShowTabBar && "pb-8"
        )}
      >
        {/* HomeScreen stays mounted across navigation so its category cards
            are never rebuilt/re-decoded. It is only hidden (display:none)
            while another screen is active, then revealed already-rendered. */}
        <div style={isHome ? undefined : { display: "none" }}>
          <HomeScreen />
        </div>
        <Outlet />
      </main>
      {isDebug ? <DevDebugPanel /> : null}
      {shouldShowTabBar ? <TabBar items={tabBarItems} /> : null}

      {challengeConfirmationDialog ? (
        <div className="overlay-scrim fixed inset-0 z-40 flex items-center justify-center px-4 py-6">
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
