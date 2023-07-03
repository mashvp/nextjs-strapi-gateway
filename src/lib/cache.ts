const CacheMap = new Map<string, unknown>();

export const hasCache = (key: string) => CacheMap.has(key);

export const putCache = (key: string, value: unknown) =>
  CacheMap.set(key, value);

export const getCache = (key: string) => CacheMap.get(key);

export const removeCache = (key: string) => CacheMap.delete(key);
