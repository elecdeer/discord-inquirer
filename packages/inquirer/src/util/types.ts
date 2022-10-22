export type SetNullable<T, K extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, K>
> & {
  [P in K]: T[P] | null;
};

export type Awaitable<T> = T | PromiseLike<T>;
