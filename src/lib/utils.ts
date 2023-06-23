/**
 * Returns a Promise that resolves after a given delay
 *
 * @param delay the delay in milliseconds to wait for
 * @returns Promise<void>
 */
export const wait = async (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};
