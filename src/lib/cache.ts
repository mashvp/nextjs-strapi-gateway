import sha256 from 'crypto-js/sha256';

import { serializeUrlParamsObject } from './utils';

const CacheMap = new Map<string, unknown>();

export const hasCache = (key: string) => CacheMap.has(key);

export const putCache = (key: string, value: unknown) =>
  CacheMap.set(key, value);

export const getCache = (key: string) => CacheMap.get(key);

export const removeCache = (key: string) => CacheMap.delete(key);

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
