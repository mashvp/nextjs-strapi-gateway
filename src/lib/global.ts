import type { APICallFunc } from './api';
import type { Wrapped } from './types';

/**
 * Gets the type of the data returned by a wrapped global API call.
 *
 * Usage:
 *
 * ```ts
 * type MyReturnType = GlobalAPICallReturnType<typeof myWrappedFetchFunction>;
 * ```
 */
export type GlobalAPICallReturnType<T extends APICallFunc<unknown>> = Partial<
  Awaited<ReturnType<T>>
>;

/**
 * Creates a function to fetch data from the Strapi API with global calls
 * embedded in the response.
 *
 * This function is useful for wrapping fetch calls that will need data that
 * is necessary in all parts of the application.
 * The response for the fetchCall provided to the resulting function will be
 * kept on top level, while globals will be accessible inside the `global` key.
 *
 * Note: This function is generic, you need to pass in the types of the global
 * calls. The correct type should be the union of the return value
 * of all global calls, which can be obtained using
 * the `GlobalAPICallReturnType` helper.
 *
 * Example: For the global calls `foo`, `bar` and `baz`, the correct type is:
 *
 * ```ts
 * type APIGlobals = GlobalAPICallReturnType<typeof foo> &
 *                   GlobalAPICallReturnType<typeof bar> &
 *                   GlobalAPICallReturnType<typeof baz>;
 * ```
 *
 * @param globalCalls the list of global calls to embed
 *
 * @returns the API fetch function with embedded global calls
 */
export const createGlobalDataWrapper =
  <G>(...globalCalls: Array<APICallFunc<G>>) =>
  async <T>(fetchCall: APICallFunc<T>): Promise<T & Wrapped<'global', G>> => {
    const [callResponse, ...globalResponses] = await Promise.allSettled([
      fetchCall(),
      ...globalCalls.map((call) => call()),
    ]);

    const globalData = globalResponses.reduce((acc, response) => {
      if (response.status === 'fulfilled') {
        return { ...acc, ...response.value };
      }

      throw response.reason;
    }, {} as G);

    if (callResponse.status === 'fulfilled') {
      return {
        ...callResponse.value,
        global: globalData,
      };
    }

    throw callResponse.reason;
  };
