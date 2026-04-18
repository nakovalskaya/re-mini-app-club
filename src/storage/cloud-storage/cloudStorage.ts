import { getTelegramWebApp } from "@/features/telegram/telegram";

export interface CloudStorageAdapter {
  getItem(key: string): Promise<string | null>;
  getItems(keys: string[]): Promise<Record<string, string | null>>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

type StorageMode = "telegram" | "local" | "unavailable";

type CloudStorageDebugEvent = {
  timestamp: string;
  op: "getItem" | "getItems" | "setItem" | "removeItem";
  key?: string;
  keys?: string[];
  mode: StorageMode;
  ok: boolean;
  value?: string | null;
  values?: Record<string, string | null>;
  error?: string;
};

type CloudStorageDebugState = {
  mode: StorageMode;
  isTelegramWebApp: boolean;
  hasCloudStorage: boolean;
  lastReadKey?: string;
  lastReadValue?: string | null;
  lastWriteKey?: string;
  lastWriteValue?: string;
  lastError?: string;
  events: CloudStorageDebugEvent[];
};

declare global {
  interface Window {
    __MINI_APP_STORAGE_DEBUG__?: CloudStorageDebugState;
  }
}

const MAX_DEBUG_EVENTS = 20;
const TELEGRAM_CLOUD_STORAGE_WAIT_MS = 1_500;
const TELEGRAM_CLOUD_STORAGE_POLL_MS = 50;

function getStorageMode(): {
  mode: StorageMode;
  isTelegramWebApp: boolean;
  hasCloudStorage: boolean;
} {
  const webApp = getTelegramWebApp();
  const isTelegramWebApp = Boolean(webApp);
  const hasCloudStorage = Boolean(webApp?.CloudStorage);

  if (hasCloudStorage) {
    return { mode: "telegram", isTelegramWebApp, hasCloudStorage };
  }

  if (isTelegramWebApp) {
    return { mode: "unavailable", isTelegramWebApp, hasCloudStorage };
  }

  return { mode: "local", isTelegramWebApp, hasCloudStorage };
}

function isDev() {
  return typeof import.meta !== "undefined" && import.meta.env?.DEV;
}

function debugStorage(event: CloudStorageDebugEvent) {
  if (typeof window === "undefined") {
    return;
  }

  const meta = getStorageMode();
  const current = window.__MINI_APP_STORAGE_DEBUG__ ?? {
    mode: meta.mode,
    isTelegramWebApp: meta.isTelegramWebApp,
    hasCloudStorage: meta.hasCloudStorage,
    events: []
  };

  const next: CloudStorageDebugState = {
    ...current,
    mode: meta.mode,
    isTelegramWebApp: meta.isTelegramWebApp,
    hasCloudStorage: meta.hasCloudStorage,
    lastReadKey:
      event.op === "getItem" || event.op === "getItems" ? event.key ?? event.keys?.join(",") : current.lastReadKey,
    lastReadValue:
      event.op === "getItem"
        ? event.value ?? null
        : event.op === "getItems"
          ? JSON.stringify(event.values ?? {})
          : current.lastReadValue,
    lastWriteKey:
      event.op === "setItem" || event.op === "removeItem"
        ? event.key ?? current.lastWriteKey
        : current.lastWriteKey,
    lastWriteValue: event.op === "setItem" ? event.value ?? "" : current.lastWriteValue,
    lastError: event.ok ? undefined : event.error,
    events: [event, ...current.events].slice(0, MAX_DEBUG_EVENTS)
  };

  window.__MINI_APP_STORAGE_DEBUG__ = next;

  if (isDev()) {
    const method = event.ok ? "info" : "error";
    console[method]("[mini-app-storage]", event);
  }
}

function createUnavailableError() {
  return new Error(
    "Telegram WebApp is available, but CloudStorage API is unavailable in this environment."
  );
}

function createOperationTimeoutError(operation: string, key?: string) {
  return new Error(
    `Telegram CloudStorage ${operation} timed out${key ? ` for key "${key}"` : ""}.`
  );
}

async function withOperationTimeout<T>(
  operation: string,
  promise: Promise<T>,
  key?: string,
  timeoutMs = 2000
) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(createOperationTimeoutError(operation, key));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

async function waitForTelegramCloudStorage(timeoutMs = TELEGRAM_CLOUD_STORAGE_WAIT_MS) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const cloudStorage = getTelegramWebApp()?.CloudStorage;
    if (cloudStorage) {
      return cloudStorage;
    }

    await new Promise((resolve) => window.setTimeout(resolve, TELEGRAM_CLOUD_STORAGE_POLL_MS));
  }

  return null;
}

const localStorageAdapter: CloudStorageAdapter = {
  async getItem(key) {
    const value = window.localStorage.getItem(key);
    debugStorage({
      timestamp: new Date().toISOString(),
      op: "getItem",
      key,
      mode: "local",
      ok: true,
      value
    });
    return value;
  },
  async getItems(keys) {
    const values = keys.reduce<Record<string, string | null>>((acc, key) => {
      acc[key] = window.localStorage.getItem(key);
      return acc;
    }, {});
    debugStorage({
      timestamp: new Date().toISOString(),
      op: "getItems",
      keys,
      mode: "local",
      ok: true,
      values
    });
    return values;
  },
  async setItem(key, value) {
    window.localStorage.setItem(key, value);
    debugStorage({
      timestamp: new Date().toISOString(),
      op: "setItem",
      key,
      mode: "local",
      ok: true,
      value
    });
  },
  async removeItem(key) {
    window.localStorage.removeItem(key);
    debugStorage({
      timestamp: new Date().toISOString(),
      op: "removeItem",
      key,
      mode: "local",
      ok: true
    });
  }
};

const telegramStorageAdapter: CloudStorageAdapter = {
  async getItem(key) {
    const cloudStorage = await waitForTelegramCloudStorage();

    if (!cloudStorage) {
      const error = createUnavailableError();
      debugStorage({
        timestamp: new Date().toISOString(),
        op: "getItem",
        key,
        mode: "unavailable",
        ok: false,
        error: error.message
      });
      throw error;
    }

    return withOperationTimeout<string | null>(
      "getItem",
      new Promise<string | null>((resolve, reject) => {
        cloudStorage.getItem(key, (error, value) => {
          if (error) {
            debugStorage({
              timestamp: new Date().toISOString(),
              op: "getItem",
              key,
              mode: "telegram",
              ok: false,
              error: String(error)
            });
            reject(error);
            return;
          }

          debugStorage({
            timestamp: new Date().toISOString(),
            op: "getItem",
            key,
            mode: "telegram",
            ok: true,
            value: value ?? null
          });
          resolve(value ?? null);
        });
      }),
      key
    ).catch((error) => {
      debugStorage({
        timestamp: new Date().toISOString(),
        op: "getItem",
        key,
        mode: "telegram",
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    });
  },
  async getItems(keys) {
    const cloudStorage = await waitForTelegramCloudStorage();

    if (!cloudStorage) {
      const error = createUnavailableError();
      debugStorage({
        timestamp: new Date().toISOString(),
        op: "getItems",
        keys,
        mode: "unavailable",
        ok: false,
        error: error.message
      });
      throw error;
    }

    return withOperationTimeout<Record<string, string | null>>(
      "getItems",
      new Promise<Record<string, string | null>>((resolve, reject) => {
        cloudStorage.getItems(keys, (error, values) => {
          if (error) {
            debugStorage({
              timestamp: new Date().toISOString(),
              op: "getItems",
              keys,
              mode: "telegram",
              ok: false,
              error: String(error)
            });
            reject(error);
            return;
          }

          const normalized = keys.reduce<Record<string, string | null>>((acc, key) => {
            acc[key] = values?.[key] ?? null;
            return acc;
          }, {});

          debugStorage({
            timestamp: new Date().toISOString(),
            op: "getItems",
            keys,
            mode: "telegram",
            ok: true,
            values: normalized
          });
          resolve(normalized);
        });
      }),
      keys.join(",")
    ).catch((error) => {
      debugStorage({
        timestamp: new Date().toISOString(),
        op: "getItems",
        keys,
        mode: "telegram",
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    });
  },
  async setItem(key, value) {
    const cloudStorage = await waitForTelegramCloudStorage();

    if (!cloudStorage) {
      const error = createUnavailableError();
      debugStorage({
        timestamp: new Date().toISOString(),
        op: "setItem",
        key,
        mode: "unavailable",
        ok: false,
        value,
        error: error.message
      });
      throw error;
    }

    return withOperationTimeout(
      "setItem",
      new Promise<void>((resolve, reject) => {
        cloudStorage.setItem(key, value, (error) => {
          if (error) {
            debugStorage({
              timestamp: new Date().toISOString(),
              op: "setItem",
              key,
              mode: "telegram",
              ok: false,
              value,
              error: String(error)
            });
            reject(error);
            return;
          }

          debugStorage({
            timestamp: new Date().toISOString(),
            op: "setItem",
            key,
            mode: "telegram",
            ok: true,
            value
          });
          resolve();
        });
      }),
      key
    ).catch((error) => {
      debugStorage({
        timestamp: new Date().toISOString(),
        op: "setItem",
        key,
        mode: "telegram",
        ok: false,
        value,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    });
  },
  async removeItem(key) {
    const cloudStorage = await waitForTelegramCloudStorage();

    if (!cloudStorage) {
      const error = createUnavailableError();
      debugStorage({
        timestamp: new Date().toISOString(),
        op: "removeItem",
        key,
        mode: "unavailable",
        ok: false,
        error: error.message
      });
      throw error;
    }

    return withOperationTimeout(
      "removeItem",
      new Promise<void>((resolve, reject) => {
        cloudStorage.removeItem(key, (error) => {
          if (error) {
            debugStorage({
              timestamp: new Date().toISOString(),
              op: "removeItem",
              key,
              mode: "telegram",
              ok: false,
              error: String(error)
            });
            reject(error);
            return;
          }

          debugStorage({
            timestamp: new Date().toISOString(),
            op: "removeItem",
            key,
            mode: "telegram",
            ok: true
          });
          resolve();
        });
      }),
      key
    ).catch((error) => {
      debugStorage({
        timestamp: new Date().toISOString(),
        op: "removeItem",
        key,
        mode: "telegram",
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    });
  }
};

export function getCloudStorageMode() {
  return getStorageMode();
}

export function getCloudStorageDebugState() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.__MINI_APP_STORAGE_DEBUG__ ?? null;
}

export async function resetLocalFallbackStorage(keys: string[]) {
  keys.forEach((key) => {
    window.localStorage.removeItem(key);
  });

  debugStorage({
    timestamp: new Date().toISOString(),
    op: "removeItem",
    keys,
    mode: "local",
    ok: true
  });
}

export const cloudStorage: CloudStorageAdapter = {
  async getItem(key) {
    const { mode } = getStorageMode();
    if (mode === "telegram" || mode === "unavailable") {
      return telegramStorageAdapter.getItem(key);
    }
    return localStorageAdapter.getItem(key);
  },
  async getItems(keys) {
    const { mode } = getStorageMode();
    if (mode === "telegram" || mode === "unavailable") {
      return telegramStorageAdapter.getItems(keys);
    }
    return localStorageAdapter.getItems(keys);
  },
  async setItem(key, value) {
    const { mode } = getStorageMode();
    if (mode === "telegram" || mode === "unavailable") {
      return telegramStorageAdapter.setItem(key, value);
    }
    return localStorageAdapter.setItem(key, value);
  },
  async removeItem(key) {
    const { mode } = getStorageMode();
    if (mode === "telegram" || mode === "unavailable") {
      return telegramStorageAdapter.removeItem(key);
    }
    return localStorageAdapter.removeItem(key);
  }
};
