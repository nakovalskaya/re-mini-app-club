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

/**
 * Programmatically click a hidden anchor pointing to the URL. The WebView in
 * the Telegram client intercepts the navigation natively — same code path the
 * client uses when a user taps a link inside a chat message — and resolves
 * the link through its real URL parser (the one that correctly handles
 * private channel posts) rather than the WebApp routing layer (which mangles
 * `t.me/c/<CHAT_ID>/<MSG_ID>` on iOS).
 *
 * Must be invoked synchronously inside a user-gesture handler (e.g. an
 * onClick) so the browser doesn't treat it as a programmatic popup.
 */
function openViaAnchorClick(url: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function openTelegramLink(url: string) {
  // Notion sometimes leaves trailing whitespace/newlines when an editor pastes
  // a URL; Telegram's openTelegramLink silently drops you on the home screen
  // when it can't parse the link, so trim before doing anything else.
  const cleaned = url.trim();
  const webApp = getTelegramObject();

  // Native tg:// schemes (tg://privatepost?channel=…&post=…, tg://resolve, …)
  // bypass the t.me URL parser entirely. Many Telegram clients accept these
  // directly in openTelegramLink and navigate without opening any browser.
  if (cleaned.startsWith("tg://")) {
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(cleaned);
      return;
    }
    // No WebApp API available — try a raw scheme handoff to the OS.
    window.location.href = cleaned;
    return;
  }

  // Private channel post: https://t.me/c/<CHAT_ID>/<MSG_ID>
  // WebApp's openTelegramLink mishandles these on iOS — it closes the Mini
  // App but Telegram lands on the channel's home rather than the specific
  // post. Trigger a hidden anchor click instead: the WebView's native
  // navigation handler intercepts the link the same way it would a tap inside
  // a chat message, which uses Telegram's real URL parser and opens the post.
  const isPrivateChannelLink = /^https?:\/\/t\.me\/c\/\d+\/\d+/i.test(cleaned);
  if (isPrivateChannelLink) {
    openViaAnchorClick(cleaned);
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
