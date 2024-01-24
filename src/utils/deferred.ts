/**
 * Represents a deferred promise.
 *
 * The promise will remain in pending state until either
 * `resolve` or `reject` are called.
 */
export interface Deferred<T> {
  resolve: (arg: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
  promise: Promise<T>;
}

/**
 * Create a deferred promise of type T
 * @returns a {@link Deferred} promise
 */
export function defer<T>(): Deferred<T> {
  const deferred = {} as Deferred<T>;
  const promise = new Promise<T>(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  deferred.promise = promise;
  return deferred;
}
