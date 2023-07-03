import sha256 from 'crypto-js/sha256';
import { serializeUrlParamsObject } from './utils';

export interface CacheMapElement {
  timestamp: number;
  value: unknown;
}

const cacheMap = new Map<string, CacheMapElement>();

export const hasCache = (key: string) => cacheMap.has(key);

export const expireCache = (key: string, shelfLife: number = 60_000) => {
  const rawCache = getCacheRaw(key);

  if (rawCache) {
    const then = rawCache.timestamp;
    const now = Date.now();

    if (now - then >= shelfLife) {
      removeCache(key);
    }
  }
};

export const putCache = (key: string, value: unknown) =>
  cacheMap.set(key, { timestamp: Date.now(), value });

export const getCacheRaw = (key: string) => cacheMap.get(key);

export const getCache = (key: string) => cacheMap.get(key)?.value;

export const removeCache = (key: string) => cacheMap.delete(key);

/**
 * Computes the cache key for this request
 *
 * @param path the API path to query
 * @param urlParamsObject the API params object
 * @returns string
 */
export const getCacheKey = async (
  path: string,
  urlParamsObject: Record<string, unknown> = {}
) => {
  const serializedParams = serializeUrlParamsObject(urlParamsObject);
  const cacheKey = [path, serializedParams].join('__');

  return sha256(cacheKey).toString();
};
