import { getTelegramWebApp } from "@/features/telegram/telegram";

export interface CloudStorageAdapter {
  getItem(key: string): Promise<string | null>;
  getItems(keys: string[]): Promise<Record<string, string | null>>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const fallbackStorage: CloudStorageAdapter = {
  async getItem(key) {
    return window.localStorage.getItem(key);
  },
  async getItems(keys) {
    return keys.reduce<Record<string, string | null>>((acc, key) => {
      acc[key] = window.localStorage.getItem(key);
      return acc;
    }, {});
  },
  async setItem(key, value) {
    window.localStorage.setItem(key, value);
  },
  async removeItem(key) {
    window.localStorage.removeItem(key);
  }
};

const telegramStorage: CloudStorageAdapter = {
  async getItem(key) {
    const webApp = getTelegramWebApp();
    const cloudStorage = webApp?.CloudStorage;

    if (!cloudStorage) {
      return fallbackStorage.getItem(key);
    }

    return new Promise((resolve, reject) => {
      cloudStorage.getItem(key, (error, value) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(value ?? null);
      });
    });
  },
  async getItems(keys) {
    const webApp = getTelegramWebApp();
    const cloudStorage = webApp?.CloudStorage;

    if (!cloudStorage) {
      return fallbackStorage.getItems(keys);
    }

    return new Promise((resolve, reject) => {
      cloudStorage.getItems(keys, (error, values) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(
          keys.reduce<Record<string, string | null>>((acc, key) => {
            acc[key] = values?.[key] ?? null;
            return acc;
          }, {})
        );
      });
    });
  },
  async setItem(key, value) {
    const webApp = getTelegramWebApp();
    const cloudStorage = webApp?.CloudStorage;

    if (!cloudStorage) {
      return fallbackStorage.setItem(key, value);
    }

    return new Promise((resolve, reject) => {
      cloudStorage.setItem(key, value, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  },
  async removeItem(key) {
    const webApp = getTelegramWebApp();
    const cloudStorage = webApp?.CloudStorage;

    if (!cloudStorage) {
      return fallbackStorage.removeItem(key);
    }

    return new Promise((resolve, reject) => {
      cloudStorage.removeItem(key, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
};

export const cloudStorage = telegramStorage;
