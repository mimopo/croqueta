/**
 * Memoizes a function by caching the result of its last execution.
 *
 * This function is useful for optimizing functions that are called repeatedly
 * with the same arguments in sequence. It only stores the arguments and result
 * of the most recent call.
 *
 * @template T The type of the function to memoize. It must be a function that
 *             takes any number of arguments and returns a value.
 * @param {T} fn The function to memoize.
 * @returns {T} A new function that is a memoized version of `fn`.
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  let lastArgs: Parameters<T> | undefined;
  let lastResult: ReturnType<T>;

  return function (...args: Parameters<T>): ReturnType<T> {
    // Check if the new arguments are the same as the last ones.
    if (lastArgs && args.length === lastArgs.length && args.every((arg, index) => arg === lastArgs?.[index])) {
      // If they are the same, return the cached result.
      return lastResult;
    }

    // If arguments are different or it's the first call, execute the function.
    const result = fn(...args);

    // Cache the new arguments and the new result.
    lastArgs = args;
    lastResult = result;

    // Return the new result.
    return result;
  } as T;
}
