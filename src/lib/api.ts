import qs from 'qs';

import type { ObjectWithProp } from './types';

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
 *
 * @returns the API response as JSON
 */
export const fetchAPI = async <T>(
  path: string,
  urlParamsObject: Record<string, unknown> = {},
  options: RequestInit = {}
) => {
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
    throw new Error(message);
  }

  try {
    const json = await response.json();

    return json as T;
  } catch (error) {
    const message = ['Strapi API JSON error:', error, '@', path].join(' ');

    console.error(message);
    throw error;
  }
};

/**
 * Fakes a call to the API and responds with an empty object
 *
 * @returns the dummy API response as JSON
 */
export const fetchNoop = async <T>() => {
  return {} as T;
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
