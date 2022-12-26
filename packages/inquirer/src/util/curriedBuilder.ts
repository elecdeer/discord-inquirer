//全てのパラメータがオプショナルかどうか
import type { Equal, StrictPropertyCheck } from "./types";

type IsAllPartial<T> = Equal<T, Partial<T>>;

type If<C, T, F> = C extends true ? T : F;

export type BindableBuilder<Props, Terminal> = Unfulfilled<
  Props,
  unknown,
  Terminal
>;

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
  const set = (obj: Partial<T>, props: Partial<T>) => {
    //上書きしない
    return impl({ ...props, ...obj });
  };

  const build = (obj: Partial<T>) => {
    return terminalOp(obj as T);
  };

  const impl = (obj: Partial<T>) => (props: Partial<T> | undefined) => {
    if (props === undefined) {
      return build(obj);
    } else {
      return set(obj, props);
    }
  };

  return impl({});
};

export function createCurriedBuilder<T extends object>(): BindableBuilder<T, T>;
export function createCurriedBuilder<T extends object, U>(
  terminalOp: (props: T) => U
): BindableBuilder<T, U>;
export function createCurriedBuilder<T extends object, U>(
  terminalOp?: (props: T) => U
) {
  if (terminalOp === undefined) {
    return builderImpl<T, T>((props) => props);
  } else {
    return builderImpl<T, U>(terminalOp);
  }
}
