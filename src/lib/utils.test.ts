import { test, expect, describe } from 'vitest';
import { deepSortObject, serializeUrlParamsObject, wait } from './utils';
import { getCacheKey } from './cache';

describe('wait', () => {
  test('resolves', async () => {
    await expect(wait(10)).resolves;
  });

  test('resolves after a given delay', async () => {
    const start = Date.now();
    await wait(100);
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(98);
    expect(end - start).toBeLessThanOrEqual(102);
  });
});

describe('deepSortObject', () => {
  test('sorts an array', () => {
    expect(deepSortObject(['b', 'c', 'a', 'd'])).toEqual(['a', 'b', 'c', 'd']);
  });

  test('sorts an object', () => {
    expect(
      JSON.stringify(
        deepSortObject({
          z: 'baz',
          b: 'foo',
          a: 'bar',
        })
      )
    ).toEqual(
      JSON.stringify({
        a: 'bar',
        b: 'foo',
        z: 'baz',
      })
    );
  });

  test('sorts a object with nested array', () => {
    expect(
      JSON.stringify(
        deepSortObject({
          b: 'foobar',
          a: ['c', 'a', 'b'],
        })
      )
    ).toEqual(
      JSON.stringify({
        a: ['a', 'b', 'c'],
        b: 'foobar',
      })
    );
  });

  test('sorts an object with a nested object', () => {
    expect(
      JSON.stringify(
        deepSortObject({
          b: { b: 1, a: 2 },
          a: { z: 999, c: 123 },
        })
      )
    ).toEqual(
      JSON.stringify({
        a: { c: 123, z: 999 },
        b: { a: 2, b: 1 },
      })
    );
  });
});

describe('serializeUrlParamsObject', () => {
  test('serializes a basic params object', () => {
    expect(
      serializeUrlParamsObject({
        populate: 'deep',
        fields: ['slug', 'locale'],
      })
    ).toEqual(
      JSON.stringify({
        fields: ['locale', 'slug'],
        populate: 'deep',
      })
    );
  });
});

describe('getCacheKey', () => {
  test('gets the same cache key regardless of params order', async () => {
    const key =
      '23bd81a05a22d41a152732daa10b27ea886b84e6da1fc477a7b2401ff6840e20';

    await expect(
      getCacheKey('/dummy', {
        populate: 'deep',
        fields: ['slug', 'locale'],
      })
    ).resolves.toEqual(key);

    await expect(
      getCacheKey('/dummy', {
        fields: ['locale', 'slug'],
        populate: 'deep',
      })
    ).resolves.toEqual(key);
  });
});
