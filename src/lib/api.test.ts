import { test, expect, describe, vi, beforeEach } from 'vitest';
import {
  fetchAPI,
  fetchNoop,
  getStrapiURL,
  retry,
  wrappedFetchAPI,
} from './api';

beforeEach(async () => {
  vi.stubGlobal('process', {
    env: {
      STRAPI_API_TOKEN: process.env.VITE_STRAPI_API_TOKEN,
    },
  });

  return async () => {
    vi.unstubAllGlobals();
  };
});

describe('getStrapiURL', () => {
  test('gets the strapi api url', () => {
    expect(getStrapiURL('/api/dummy')).toBe('http://localhost:1337/api/dummy');
  });
});

describe('fetchAPI', () => {
  test('fetches a basic api endpoint', async () => {
    expect(await fetchAPI('/homepage')).toMatchObject({
      data: {
        id: expect.any(Number),
        attributes: expect.any(Object),
      },
    });
  });

  test('fetches an api endpoint with a querystring', async () => {
    expect(await fetchAPI('/homepage', { populate: '*' })).toMatchObject({
      data: {
        id: expect.any(Number),
        attributes: {
          seo: expect.any(Object),
        },
      },
    });
  });

  test('fails with 404 error on unknown endpoint', async () => {
    await expect(() => fetchAPI('/invalid')).rejects.toThrowError(
      /404 not found/i
    );
  });

  test('fails on invalid or missing access token', async () => {
    vi.stubGlobal('process', {
      env: { STRAPI_API_TOKEN: '__INVALID__' },
    });

    await expect(() => fetchAPI('/homepage')).rejects.toThrowError(
      /401 unauthorized/i
    );
  });

  test('fails on invalid response format (not json)', async () => {
    await expect(() => fetchAPI('/ping/bare')).rejects.toThrowError(
      SyntaxError
    );
  });
});

describe('fetchNoop', () => {
  test('returns an empty object', async () => {
    expect(await fetchNoop()).toStrictEqual({});
  });

  test('returns the passed object', async () => {
    const value = { foo: 'bar' };

    expect(await fetchNoop(value)).toStrictEqual(value);
  });
});

describe('wrappedFetchAPI', () => {
  test('fetches a basic wrapped api endpoint', async () => {
    expect(await wrappedFetchAPI('foobar', ['/homepage'])).toMatchObject({
      foobar: {
        data: {
          id: expect.any(Number),
          attributes: expect.any(Object),
        },
      },
    });
  });

  test('fails with 404 error on unknown endpoint', async () => {
    await expect(() =>
      wrappedFetchAPI('invalid', ['/invalid'])
    ).rejects.toThrowError(/404 not found/i);
  });
});

describe('retry', () => {
  test('tries three times then gives up', async () => {
    await expect(retry(() => fetchAPI('/dummy'), 3, 100)).throws;
  });
});
