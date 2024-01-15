import { test, expect, describe, vi, beforeEach } from 'vitest';
import {
  getStrapiMediaURL,
  ImageDataFormat,
  UntransformedImageMedia,
  type ImageMedia,
  isImageMedia,
  isImageDataFormat,
  isUntransformedImageMedia,
  isObject,
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

  test('returns the api-prefixed url from untransformed media data', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: '/fake.png',
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

    expect(getStrapiMediaURL(fakeMedia)).toBe('http://localhost:1337/fake.png');
  });

  test('returns the bare url from untransformed media data', () => {
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

  test('returns the api-prefixed url from untransformed media data of requested format', () => {
    const fakeBase: ImageDataFormat = {
      name: 'Fake',
      hash: 'fake123',
      url: '/fake.png',
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
        medium: { ...fakeBase, url: '/good.png' },
        large: fakeBase,
      },
    };

    expect(getStrapiMediaURL(fakeMedia, 'medium')).toBe(
      'http://localhost:1337/good.png'
    );
  });

  test('returns the bare url from untransformed media data of requested format', () => {
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
        medium: { ...fakeBase, url: 'http://example.com/good.png' },
        large: fakeBase,
      },
    };

    expect(getStrapiMediaURL(fakeMedia, 'medium')).toBe(
      'http://example.com/good.png'
    );
  });

  test('returns null for a null media', () => {
    expect(getStrapiMediaURL(null!)).toBeNull();
  });

  test('returns null for not an object value', () => {
    expect(getStrapiMediaURL('not a media' as any)).toBeNull();
  });

  test('returns null for an invalid media object', () => {
    expect(getStrapiMediaURL({ invalid: true } as any)).toBeNull();
  });
});

describe('isObject', () => {
  test('predicate for object: valid', () => {
    expect(isObject({})).toBeTruthy();
  });

  test('predicate for object: null', () => {
    expect(isObject(null)).toBeFalsy();
  });

  test('predicate for object: undefined', () => {
    expect(isObject(undefined)).toBeFalsy();
  });

  test('predicate for object: NaN', () => {
    expect(isObject(NaN)).toBeFalsy();
  });

  test('predicate for object: number', () => {
    expect(isObject(42)).toBeFalsy();
  });

  test('predicate for object: string', () => {
    expect(isObject('Lorem ipsum')).toBeFalsy();
  });

  test('predicate for object: array', () => {
    expect(isObject(['one', 'two', 'three'])).toBeFalsy();
  });
});

describe('isImageMedia', () => {
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

  test('predicate for image media: null', () => {
    expect(isImageMedia(null!)).toBeFalsy();
  });

  test('predicate for image media: not an object', () => {
    expect(isImageMedia('bad value' as any)).toBeFalsy();
  });
});

describe('isImageDataFormat', () => {
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

  test('predicate for image data format: null', () => {
    expect(isImageDataFormat(null!)).toBeFalsy();
  });

  test('predicate for image data format: not an object', () => {
    expect(isImageDataFormat('bad value' as any)).toBeFalsy();
  });
});

describe('isImageDataFormat', () => {
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

  test('predicate for untransformed image media: null', () => {
    expect(isUntransformedImageMedia(null!)).toBeFalsy();
  });

  test('predicate for untransformed image media: not an object', () => {
    expect(isUntransformedImageMedia('bad value' as any)).toBeFalsy();
  });
});
