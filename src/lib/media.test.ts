import { test, expect, describe, vi, beforeEach } from 'vitest';
import { getStrapiMediaURL, ImageDataFormat, type ImageMedia } from './media';

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

describe('getStrapiMediaURL', () => {
  test('returns the api-prefixed url from media data', () => {
    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          name: 'Fake',
          hash: 'fake123',
          url: '/fake.png',
          ext: 'png',
          mime: 'image/png',
          width: 800,
          height: 600,
          formats: {},
        },
      },
    };

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://localhost:1337/fake.png');
  });

  test('returns the bare url from media data', () => {
    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          name: 'Fake',
          hash: 'fake123',
          url: 'http://example.com/fake.png',
          ext: 'png',
          mime: 'image/png',
          width: 800,
          height: 600,
          formats: {},
        },
      },
    };

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://example.com/fake.png');
  });

  test('returns the api-prefixed url from media format', () => {
    const fakeMedia: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: '/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://localhost:1337/fake.png');
  });

  test('returns the bare url from media format', () => {
    const fakeMedia: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://example.com/fake.png');
  });
});
