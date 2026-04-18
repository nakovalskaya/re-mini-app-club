export interface TelegramWebAppCloudStorage {
  getItem(
    key: string,
    callback: (error: Error | null, value: string | null) => void
  ): void | Promise<string | null>;
  getItem(key: string): void | Promise<string | null>;
  getItems(
    keys: string[],
    callback: (error: Error | null, values: Record<string, string>) => void
  ): void | Promise<Record<string, string> | string[]>;
  getItems(keys: string[]): void | Promise<Record<string, string> | string[]>;
  setItem(
    key: string,
    value: string,
    callback?: (error: Error | null, stored?: boolean) => void
  ): void | Promise<boolean | void>;
  removeItem(
    key: string,
    callback?: (error: Error | null, removed?: boolean) => void
  ): void | Promise<boolean | void>;
}

export interface TelegramWebApp {
  ready(): void;
  expand?: () => void;
  openTelegramLink?: (url: string) => void;
  version?: string;
  platform?: string;
  CloudStorage?: TelegramWebAppCloudStorage;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
