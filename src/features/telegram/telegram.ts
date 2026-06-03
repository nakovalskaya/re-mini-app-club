import type { TelegramWebApp } from "@/shared/types/telegram";

export type AppTheme = "dark";

const APP_BACKGROUND_COLOR = "#360915";

function applyThemeToDocument(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

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

  try {
    // Prevent Telegram's pull-down-to-close gesture so the in-app scroll
    // container handles vertical swipes consistently on every screen.
    webApp?.disableVerticalSwipes?.();
  } catch {
    // Older Telegram clients may not support this; ignore.
  }

  try {
    webApp?.setBackgroundColor?.(APP_BACKGROUND_COLOR);
    webApp?.setHeaderColor?.(APP_BACKGROUND_COLOR);
    webApp?.setBottomBarColor?.(APP_BACKGROUND_COLOR);
  } catch {
    // Older Telegram clients may not support custom colors; ignore.
  }

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

function getThemeFromTelegram(_webApp: TelegramWebApp | null): AppTheme {
  return "dark";
}

export function applyTelegramThemeToDocument() {
  if (typeof document === "undefined") {
    return;
  }

  const webApp = getTelegramObject();
  const theme = getThemeFromTelegram(webApp);
  const root = document.documentElement;

  applyThemeToDocument(theme);

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

export function applyThemeOverrideToDocument(theme: AppTheme) {
  applyThemeToDocument(theme);
}

export function openTelegramLink(url: string) {
  // Notion sometimes leaves trailing whitespace/newlines when an editor pastes
  // a URL; Telegram's openTelegramLink silently drops you on the home screen
  // when it can't parse the link, so trim before doing anything else.
  const cleaned = url.trim();
  const webApp = getTelegramObject();

  // Private channel post: https://t.me/c/<CHAT_ID>/<MSG_ID>
  // openTelegramLink is flaky across Telegram client versions (especially iOS)
  // for /c/ links — it can land the user on the home screen instead of the
  // specific post. openLink with the same URL opens the in-app browser, which
  // recognises t.me and offers "Open in Telegram" → routes to the right post.
  // It's one extra tap for the user, but it works on every client.
  const isPrivateChannelLink = /^https?:\/\/t\.me\/c\/\d+\/\d+/i.test(cleaned);
  if (isPrivateChannelLink && webApp?.openLink) {
    webApp.openLink(cleaned);
    return;
  }

  // Public t.me/<username>/<postId> links — openTelegramLink handles them
  // cleanly (closes the Mini App and navigates to the post). Available
  // since Telegram 6.1.
  if (webApp?.openTelegramLink && /^https:\/\/t\.me\//i.test(cleaned)) {
    webApp.openTelegramLink(cleaned);
    return;
  }

  // Last-resort fallbacks.
  if (webApp?.openLink) {
    webApp.openLink(cleaned);
    return;
  }
  window.open(cleaned, "_blank", "noopener,noreferrer");
}

export function openExternalLink(url: string) {
  const webApp = getTelegramObject();

  if (webApp?.openLink) {
    webApp.openLink(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
