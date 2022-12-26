//全てのパラメータがオプショナルかどうか
import type { Equal, StrictPropertyCheck } from "./types";

type IsAllPartial<T> = Equal<T, Partial<T>>;

type If<C, T, F> = C extends true ? T : F;

export type BindableBuilder<Props, Terminal> = Unfulfilled<Props, unknown, Terminal>;

type Fulfilled<Props, Applied, Terminal> = Unfulfilled<
  Props,
  Applied,
  Terminal
> &
  Build<Props, Applied, Terminal>;

type Build<_, __, Terminal> = {
  (): Terminal;
};

type Unfulfilled<Props, Applied, Terminal> = {
  <P extends Partial<Omit<Props, keyof Applied>>>(
    props: StrictPropertyCheck<P, Partial<Omit<Props, keyof Applied>>>
  ): If<
    IsAllPartial<Omit<Props, keyof (Applied & P)>>,
    Fulfilled<Props, Applied & P, Terminal>,
    Unfulfilled<Props, Applied & P, Terminal>
  >;
};

const builderImpl = <T extends object, U>(terminalOp: (props: T) => U) => {
  let obj: Partial<T> = {};

  const set = (props: Partial<T>) => {
    //上書きしない
    obj = { ...props, ...obj };
    return impl;
  };

  const build = () => {
    return terminalOp(obj as T);
  };

  const impl = (props: Partial<T> | undefined) => {
    if (props === undefined) {
      return build();
    } else {
      return set(props);
    }
  };

  return impl;
};

export const createBuilder = <T extends object, U>(
  terminalOp: (props: T) => U
): BindableBuilder<T, U> => {
  return builderImpl(terminalOp) as BindableBuilder<T, U>;
};
