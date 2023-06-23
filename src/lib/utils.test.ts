import { test, expect, describe } from 'vitest';
import { wait } from './utils';

describe('wait', () => {
  test('resolves', async () => {
    await expect(wait(10)).resolves;
  });

  test('resolves after a given delay', async () => {
    const start = Date.now();
    await wait(100);
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(99);
    expect(end - start).toBeLessThanOrEqual(101);
  });
});
