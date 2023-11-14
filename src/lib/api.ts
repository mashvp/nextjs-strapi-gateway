import qs from 'qs';

import type { ObjectWithProp } from './types';
import { wait } from './utils';
import { NextjsStrapiGatewayError } from './errors';
import {
  expireCache,
  getCache,
  getCacheKey,
  hasCache,
  putCache,
} from './cache';

export type APICall<T> = (
  path: string,
  urlParamsObject?: Record<string, unknown>,
  options?: RequestInit
) => Promise<T>;

export type APICallFunc<T> = () => ReturnType<APICall<T>>;

export type WrappedAPICallFunc<V, K extends string> = (
  wrapperKey: K,
  args: Parameters<APICall<V>>
) => Promise<ObjectWithProp<K, V>>;

/**
 * Gets the API url for the given endpoint
 *
 * @param path the API endpoint path
 */
export const getStrapiURL = (path = '') =>
  [
    process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337',
    path,
  ].join('');

/**
 * Gets data from the Strapi API
 *
 * @param path the API endpoint path
 * @param urlParamsObject the query string parameters
 * @param options the options passed to the fetch call
 *                (authentication is handled automatically)
 * @param bustCache whether to ignore the cache or not
 *
 * @throws NextjsStrapiGatewayError
 *
 * @returns the API response as JSON
 */
export const fetchAPI = async <T>(
  path: string,
  urlParamsObject: Record<string, unknown> = {},
  options: RequestInit = {},
  bustCache: boolean = false
) => {
  if (!process.env.STRAPI_API_TOKEN) {
    console.warn('[warn] No Strapi API token provided');
    console.debug(process.env);
  }

  const cacheKey = await getCacheKey(path, urlParamsObject);

  expireCache(cacheKey, bustCache ? 0 : 60_000);

  if (!bustCache && hasCache(cacheKey)) {
    return getCache(cacheKey) as T;
  }

  const mergedOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      ...options?.headers,
    },
  };

  const queryString = qs.stringify(urlParamsObject);
  const endpointBase = `/api${path}`;
  const endpoint = queryString
    ? `${endpointBase}?${queryString}`
    : endpointBase;

  const requestUrl = getStrapiURL(endpoint);

  const response = await fetch(requestUrl, mergedOptions);

  if (!response.ok) {
    const message = [
      'Strapi API query error:',
      response.status,
      response.statusText,
      '@',
      path,
    ].join(' ');

    console.error(message);

    throw new NextjsStrapiGatewayError(message, {
      status: response.status,
      statusText: response.statusText,
      path,
    });
  }

  try {
    const json = await response.json();

    if (!bustCache) {
      putCache(cacheKey, json);
    }

    return json as T;
  } catch (error) {
    const message = ['Strapi API JSON error:', error, '@', path].join(' ');

    console.error(message);

    throw new NextjsStrapiGatewayError(message, {
      originalError: error,
      status: response.status,
      statusText: response.statusText,
      path,
    });
  }
};

/**
 * Fakes a call to the API and responds with an empty object
 *
 * @returns the dummy API response as JSON
 */
export const fetchNoop = async <T>(value: T = {} as T) => {
  return value;
};

/**
 * Gets data from the Strapi API and returns it in the form of a wrapper
 * object under the given key
 *
 * @param wrapperKey the key to wrap the API response in
 *
 * @returns the wrapped API response object
 */
export const wrappedFetchAPI = async <K extends string, V>(
  wrapperKey: K,
  args: Parameters<APICall<V>>
): Promise<ObjectWithProp<K, V>> => {
  const response = await fetchAPI<V>(...args);

  return { [wrapperKey]: response } as ObjectWithProp<K, V>;
};

/**
 * Wraps a fetch call and retries it up to `maxTries` times if it fails.
 *
 * @param fetchCall the API call function
 * @param maxTries the maximum number of tries to run
 * @param waitDelay the delay in milliseconds to wait before each tries
 *
 * @returns the API response data or null
 */
export const retry = async <T>(
  fetchCall: APICallFunc<T>,
  maxTries: number,
  waitDelay: number = 0
) => {
  let lastError;

  for (let round = 0; round < maxTries; round += 1) {
    try {
      return await fetchCall();
    } catch (error) {
      lastError = error;

      if (error instanceof NextjsStrapiGatewayError) {
        const { details } = error;

        if (details) {
          const { path } = details;

          console.warn(
            [
              `(${round + 1}/${maxTries}) Retry:`,
              (error as Error).message,
              '@',
              path,
            ].join(' ')
          );
        } else {
          console.warn(
            [
              `(${round + 1}/${maxTries}) Retry:`,
              (error as Error).message,
            ].join(' ')
          );
        }
      } else {
        console.warn(
          [`(${round + 1}/${maxTries}) Retry:`, (error as Error).message].join(
            ' '
          )
        );
      }

      if (round < maxTries - 1) {
        await wait(waitDelay);
      }
    }
  }

  throw lastError;
};
