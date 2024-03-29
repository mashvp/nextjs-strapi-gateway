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

export type SortObject = Record<string, unknown> | string[];

/**
 * Deeply sorts objects and array alphanumerically
 *
 * @param object any object or array
 * @returns the sorted object or array
 */
export const deepSortObject: (object: SortObject) => SortObject = (
  object: SortObject
) => {
  if (Array.isArray(object)) {
    return object.sort();
  }

  return Object.fromEntries(
    Object.entries(object)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => {
        if (value && typeof value === 'object') {
          return [key, deepSortObject(value as SortObject)];
        }

        return [key, value];
      })
  );
};

/**
 * Serializes a urlParamsObject
 *
 * @param urlParamsObject params object to serialize
 * @returns string
 */
export const serializeUrlParamsObject = (
  urlParamsObject: Record<string, unknown>
) => {
  const sortedObject = deepSortObject(urlParamsObject);

  return JSON.stringify(sortedObject);
};
