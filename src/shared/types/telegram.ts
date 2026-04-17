export interface TelegramWebAppCloudStorage {
  getItem(
    key: string,
    callback: (error: Error | null, value: string | null) => void
  ): void;
  getItems(
    keys: string[],
    callback: (error: Error | null, values: Record<string, string>) => void
  ): void;
  setItem(
    key: string,
    value: string,
    callback?: (error: Error | null, stored?: boolean) => void
  ): void;
  removeItem(
    key: string,
    callback?: (error: Error | null, removed?: boolean) => void
  ): void;
}

export interface TelegramWebApp {
  ready(): void;
  expand?: () => void;
  openTelegramLink?: (url: string) => void;
  CloudStorage?: TelegramWebAppCloudStorage;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
