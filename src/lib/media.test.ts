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
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: '/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          ...fakeBase,
          formats: {
            thumbnail: fakeBase,
            small: fakeBase,
            medium: fakeBase,
            large: fakeBase,
          },
        },
      },
    };

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://localhost:1337/fake.png');
  });

  test('returns the bare url from media data', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          ...fakeBase,
          formats: {
            thumbnail: fakeBase,
            small: fakeBase,
            medium: fakeBase,
            large: fakeBase,
          },
        },
      },
    };

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://example.com/fake.png');
  });

  test('returns the api-prefixed url from media data of requested format', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: '/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          ...fakeBase,
          formats: {
            thumbnail: fakeBase,
            small: fakeBase,
            medium: { ...fakeBase, url: '/good.png' },
            large: fakeBase,
          },
        },
      },
    };

    expect(getStrapiMediaURL(fakeMedia, 'medium')).toBe(
      'http://localhost:1337/good.png'
    );
  });

  test('returns the bare url from media data of requested format', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          ...fakeBase,
          formats: {
            thumbnail: fakeBase,
            small: fakeBase,
            medium: { ...fakeBase, url: 'http://example.com/good.png' },
            large: fakeBase,
          },
        },
      },
    };

    expect(getStrapiMediaURL(fakeMedia, 'medium')).toBe(
      'http://example.com/good.png'
    );
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

  test('returns the bare url from untransformed media format', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: UntransformedImageMedia = {
      id: 123,
      ...fakeBase,
      formats: {
        thumbnail: fakeBase,
        small: fakeBase,
        medium: fakeBase,
        large: fakeBase,
      },
    };

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://example.com/fake.png');
  });

  test('predicate for image media: valid', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: '/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          ...fakeBase,
          formats: {
            thumbnail: fakeBase,
            small: fakeBase,
            medium: fakeBase,
            large: fakeBase,
          },
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
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: '/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          ...fakeBase,
          formats: {
            thumbnail: fakeBase,
            small: fakeBase,
            medium: fakeBase,
            large: fakeBase,
          },
        },
      },
    };

    expect(isImageDataFormat(fakeMedia)).toBeFalsy();
  });

  test('predicate for untransformed image media: valid', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: 'http://example.com/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: UntransformedImageMedia = {
      id: 123,
      ...fakeBase,
      formats: {
        thumbnail: fakeBase,
        small: fakeBase,
        medium: fakeBase,
        large: fakeBase,
      },
    };

    expect(isUntransformedImageMedia(fakeMedia)).toBeTruthy();
  });

  test('predicate for untransformed image media: invalid', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: '/fake.png',
      ext: 'png',
      mime: 'image/png',
      width: 800,
      height: 600,
    };

    const fakeMedia: ImageMedia = {
      data: {
        id: 123,
        attributes: {
          ...fakeBase,
          formats: {
            thumbnail: fakeBase,
            small: fakeBase,
            medium: fakeBase,
            large: fakeBase,
          },
        },
      },
    };

    expect(isUntransformedImageMedia(fakeMedia)).toBeFalsy();
  });
});
