import { test, expect, describe, vi, beforeEach } from 'vitest';
import {
  fetchAPI,
  fetchNoop,
  getStrapiURL,
  retry,
  wrappedFetchAPI,
} from './api';
import { NextjsStrapiGatewayError } from './errors';

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
    await expect(fetchAPI('/homepage')).resolves.toMatchObject({
      data: {
        id: expect.any(Number),
      },
    });
  });

  test('fetches an api endpoint with a querystring', async () => {
    await expect(
      fetchAPI('/homepage', { populate: '*' })
    ).resolves.toMatchObject({
      data: {
        id: expect.any(Number),
        seo: expect.any(Object),
      },
    });
  });

  test('fails with 404 error on unknown endpoint', async () => {
    await expect(fetchAPI('/invalid')).rejects.toThrowError(/404 not found/i);
  });

  test('fails on missing access token', async () => {
    vi.unstubAllGlobals();

    await expect(fetchAPI('/homepage', {}, {}, true)).rejects.toThrowError(
      /401 unauthorized/i
    );
  });

  test('fails on invalid access token', async () => {
    vi.stubGlobal('process', {
      env: { STRAPI_API_TOKEN: '__INVALID__' },
    });

    await expect(fetchAPI('/homepage', {}, {}, true)).rejects.toThrowError(
      /401 unauthorized/i
    );
  });

  test('fails on invalid response format (not json)', async () => {
    await expect(fetchAPI('/ping/bare')).rejects.toThrow(
      NextjsStrapiGatewayError
    );

    try {
      await fetchAPI('/ping/bare');
    } catch (error) {
      expect(error).toMatchObject({
        details: { originalError: expect.any(Error) },
      });

      if (error) {
        const typedError = error as NextjsStrapiGatewayError<{
          originalError: Error;
        }>;

        expect(typedError?.details?.originalError).toBeInstanceOf(SyntaxError);
      }
    }
  });
});

describe('fetchNoop', () => {
  test('returns an empty object', async () => {
    await expect(fetchNoop()).resolves.toStrictEqual({});
  });

  test('returns the passed object', async () => {
    const value = { foo: 'bar' };

    await expect(fetchNoop(value)).resolves.toStrictEqual(value);
  });
});

describe('wrappedFetchAPI', () => {
  test('fetches a basic wrapped api endpoint', async () => {
    await expect(
      wrappedFetchAPI('foobar', ['/homepage'])
    ).resolves.toMatchObject({
      foobar: {
        data: {
          id: expect.any(Number),
        },
      },
    });
  });

  test('fails with 404 error on unknown endpoint', async () => {
    await expect(wrappedFetchAPI('invalid', ['/invalid'])).rejects.toThrowError(
      /404 not found/i
    );
  });
});

describe('retry', () => {
  test('tries three times then gives up', async () => {
    await expect(retry(() => fetchAPI('/dummy'), 3)).throws;
  });

  test('tries five times, succeeds at fourth, then stops', async () => {
    let round = 0;

    const mockFetch = async () => {
      round += 1;

      if (round >= 4) {
        return { success: true };
      }

      throw new Error();
    };

    await expect(retry(mockFetch, 5)).resolves.toMatchObject({
      success: true,
    });
  });

  test('throws a builtin error with details', async () => {
    const mockFetch = async () => {
      throw new NextjsStrapiGatewayError('Retry dummy error', {
        path: '/dummy',
      });
    };

    await expect(() => retry(mockFetch, 5)).throws;
  });

  test('throws a builtin error without details', async () => {
    const mockFetch = async () => {
      throw new NextjsStrapiGatewayError('Retry dummy error');
    };

    await expect(() => retry(mockFetch, 5)).throws;
  });
});
