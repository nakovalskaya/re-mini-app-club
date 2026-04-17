import type { TelegramWebApp } from "@/shared/types/telegram";

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
  webApp?.ready();
  webApp?.expand?.();
  isInitialized = true;
}

export function getTelegramWebApp() {
  return getTelegramObject();
}

export function openTelegramLink(url: string) {
  const webApp = getTelegramObject();

  if (webApp?.openTelegramLink) {
    webApp.openTelegramLink(url);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
