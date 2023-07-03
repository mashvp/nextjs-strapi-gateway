import { test, expect, describe, beforeEach } from 'vitest';
import { getCache, hasCache, putCache, removeCache } from './cache';

beforeEach(async () => {
  putCache('dummy', {
    something: 'ok',
  });

  return async () => {
    removeCache('dummy');
  };
});

describe('hasCache', () => {
  test('cache has missing key', () => {
    expect(hasCache('foobar')).toBeFalsy;
  });

  test('cache has key', () => {
    expect(hasCache('dummy')).toBeFalsy;
  });
});

describe('cache operations', () => {
  test('put, get, remove', () => {
    expect(hasCache('new')).toBeFalsy;

    putCache('new', 'ok');

    expect(hasCache('new')).toBeTruthy;
    expect(getCache('new')).toBe('ok');

    removeCache('new');

    expect(hasCache('new')).toBeFalsy;
  });
});
