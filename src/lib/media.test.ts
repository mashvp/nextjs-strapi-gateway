import { test, expect, describe, vi, beforeEach } from 'vitest';
import {
  getStrapiMediaURL,
  ImageDataFormat,
  UntransformedImageMedia,
  type ImageMedia,
  isImageMedia,
  isImageDataFormat,
  isUntransformedImageMedia,
} from './media';

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

  test('returns the care url from untransformed media format', () => {
    const fakeMedia: UntransformedImageMedia = {
      id: 123,
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
      formats: {},
    };

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://example.com/fake.png');
  });

  test('predicate for image media: valid', () => {
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

    expect(isImageMedia(fakeMedia)).toBeTruthy();
  });

  test('predicate for image media: invalid', () => {
    const fakeMedia: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    expect(isImageMedia(fakeMedia)).toBeFalsy();
  });

  test('predicate for image data format: valid', () => {
    const fakeMedia: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    expect(isImageDataFormat(fakeMedia)).toBeTruthy();
  });

  test('predicate for image data format: invalid', () => {
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

    expect(isImageDataFormat(fakeMedia)).toBeFalsy();
  });

  test('predicate for untransformed image media: valid', () => {
    const fakeMedia: UntransformedImageMedia = {
      id: 123,
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
      formats: {},
    };

    expect(isUntransformedImageMedia(fakeMedia)).toBeTruthy();
  });

  test('predicate for untransformed image media: invalid', () => {
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

    expect(isUntransformedImageMedia(fakeMedia)).toBeFalsy();
  });
});
