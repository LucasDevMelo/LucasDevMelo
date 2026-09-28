/**
 * Thin, safe wrapper around window.localStorage.
 * This is the ONLY module that touches localStorage directly.
 * When migrating to Supabase, repositories stop using this file.
 */

export class StorageQuotaError extends Error {
  constructor() {
    super(
      "O espaço de armazenamento do navegador acabou. Tente usar menos fotos ou remover homenagens antigas.",
    );
    this.name = "StorageQuotaError";
  }
}

export class StorageUnavailableError extends Error {
  constructor() {
    super("Não foi possível acessar o armazenamento do navegador. Verifique se o modo privado está desativado.");
    this.name = "StorageUnavailableError";
  }
}

const PREFIX = "manto-azul:";

function getStorage(): Storage {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new StorageUnavailableError();
  }
  return window.localStorage;
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014)
  );
}

export const browserStorage = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = getStorage().getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  write<T>(key: string, value: T): void {
    try {
      getStorage().setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
      if (isQuotaError(error)) throw new StorageQuotaError();
      throw error;
    }
  },

  remove(key: string): void {
    try {
      getStorage().removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
};
