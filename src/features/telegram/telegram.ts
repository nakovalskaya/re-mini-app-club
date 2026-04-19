import type { TelegramWebApp } from "@/shared/types/telegram";

export type AppTheme = "light" | "dark";

function getTelegramObject(): TelegramWebApp | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Telegram?.WebApp ?? null;
}

let isInitialized = false;

export function initTelegramWebApp() {
  if (isInitialized) {
    return;
  }

  const webApp = getTelegramObject();
  if (!webApp) {
    return;
  }

  webApp?.ready();
  webApp?.expand?.();
  isInitialized = true;
}

export function getTelegramWebApp() {
  return getTelegramObject();
}

export function getTelegramRuntimeInfo() {
  const webApp = getTelegramObject();

  return {
    isAvailable: Boolean(webApp),
    version: webApp?.version ?? null,
    platform: webApp?.platform ?? null,
    hasCloudStorage: Boolean(webApp?.CloudStorage),
    colorScheme: webApp?.colorScheme ?? null
  };
}

function getThemeFromTelegram(webApp: TelegramWebApp | null): AppTheme {
  if (!webApp) {
    return "light";
  }

  if (webApp.colorScheme === "dark" || webApp.colorScheme === "light") {
    return webApp.colorScheme;
  }

  const bgColor = webApp.themeParams?.bg_color;
  if (!bgColor) {
    return "light";
  }

  const normalized = bgColor.replace("#", "");
  if (normalized.length !== 6) {
    return "light";
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance < 0.45 ? "dark" : "light";
}

export function applyTelegramThemeToDocument() {
  if (typeof document === "undefined") {
    return;
  }

  const webApp = getTelegramObject();
  const theme = getThemeFromTelegram(webApp);
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  if (webApp?.themeParams) {
    const params = webApp.themeParams;
    Object.entries(params).forEach(([key, value]) => {
      root.style.setProperty(`--tg-${key.replace(/_/g, "-")}`, value);
    });
  }
}

export function subscribeToTelegramThemeChanges(onChange: () => void) {
  const webApp = getTelegramObject();
  if (!webApp?.onEvent) {
    return () => undefined;
  }

  const handler = () => {
    applyTelegramThemeToDocument();
    onChange();
  };

  webApp.onEvent("themeChanged", handler);
  webApp.onEvent("theme_changed", handler);

  return () => {
    webApp.offEvent?.("themeChanged", handler);
    webApp.offEvent?.("theme_changed", handler);
  };
}

export function openTelegramLink(url: string) {
  const webApp = getTelegramObject();

  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
