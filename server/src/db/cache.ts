interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 30_000;

export const cache = {
  get<T>(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.value as T;
  },

  set<T>(key: string, value: T, ttl = DEFAULT_TTL): void {
    store.set(key, { value, expiresAt: Date.now() + ttl });
  },

  invalidate(pattern?: string): void {
    if (!pattern) {
      store.clear();
      return;
    }
    for (const key of store.keys()) {
      if (key.includes(pattern)) store.delete(key);
    }
  },

  get size(): number {
    return store.size;
  },
};

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}, 60_000);
