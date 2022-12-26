export type SetNullable<T, K extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, K>
> & {
  [P in K]: T[P] | null;
};

export type Awaitable<T> = T | PromiseLike<T>;

//from: https://github.com/microsoft/TypeScript/issues/27024
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;

// from: https://zenn.dev/qsf/articles/6e346f7fd3aaf1
export type StrictPropertyCheck<T, TExpected> = Exclude<
  keyof T,
  keyof TExpected
> extends never
  ? T
  : never;
