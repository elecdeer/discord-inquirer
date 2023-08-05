export type Lazy<T, V = void> = T | ((value: V) => T);

export type ResolvedLazy<T extends Lazy<unknown>, V = void> = T extends (
  param: V,
) => unknown
  ? ReturnType<T>
  : T;

function resolveLazy<T>(lazy: Lazy<T>, value?: void): T;
function resolveLazy<T>(lazy: Lazy<T> | undefined, value?: void): T | undefined;
function resolveLazy<T, V = void>(lazy: Lazy<T, V>, value: V): T;
function resolveLazy<T, V = void>(
  lazy: Lazy<T, V> | undefined,
  value: V,
): T | undefined {
  if (lazy === undefined) return undefined;
  if (lazy instanceof Function) {
    return lazy(value);
  } else {
    return lazy;
  }
}

export { resolveLazy };
