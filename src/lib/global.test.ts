import { test, expect, describe, vi, beforeEach } from 'vitest';
import { fetchAPI, wrappedFetchAPI } from './api';
import { createGlobalDataWrapper } from './global';

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

describe('createGlobalDataWrapper', () => {
  test('fetches a basic api endpoint along with global data', async () => {
    const fetchMainNavigation = async () =>
      wrappedFetchAPI('navigation', ['/menu-main', { populate: 'deep' }]);

    const withGlobalData = createGlobalDataWrapper(fetchMainNavigation);

    expect(await withGlobalData(() => fetchAPI('/homepage'))).toMatchObject({
      data: {
        id: expect.any(Number),
      },
      global: {
        navigation: {
          data: {
            id: expect.any(Number),
          },
        },
      },
    });
  });

  test('fails with 404 error on unknown global endpoint', async () => {
    const fetchMainNavigation = async () =>
      wrappedFetchAPI('invalid', ['/invalid']);

    const withGlobalData = createGlobalDataWrapper(fetchMainNavigation);

    await expect(() =>
      withGlobalData(() => fetchAPI('/homepage'))
    ).rejects.toThrowError(/404 not found/i);
  });

  test('fails with 404 error on unknown main endpoint', async () => {
    const fetchMainNavigation = async () =>
      wrappedFetchAPI('navigation', ['/menus']);

    const withGlobalData = createGlobalDataWrapper(fetchMainNavigation);

    await expect(() =>
      withGlobalData(() => fetchAPI('/invalid'))
    ).rejects.toThrowError(/404 not found/i);
  });
});
