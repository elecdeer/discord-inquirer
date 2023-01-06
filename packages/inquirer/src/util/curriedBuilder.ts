//全てのパラメータがオプショナルかどうか
import type { StrictPropertyCheck } from "./types";
import type { IsEqual } from "type-fest";

type IsAllPartial<T> = IsEqual<T, Partial<T>>;

type If<C, T, F> = C extends true ? T : F;

export type CurriedBuilder<Props, Terminal> = UnfulfilledCurriedBuilder<
  Props,
  unknown,
  Terminal
>;

export type FulfilledCurriedBuilder<Props, Applied, Terminal> =
  UnfulfilledCurriedBuilder<Props, Applied, Terminal> &
    Build<Props, Applied, Terminal>;

type Build<_, __, Terminal> = {
  (): Terminal;
};

export type UnfulfilledCurriedBuilder<Props, Applied, Terminal> = {
  <P extends Partial<Omit<Props, keyof Applied>>>(
    props: StrictPropertyCheck<P, Partial<Omit<Props, keyof Applied>>>
  ): If<
    IsAllPartial<Omit<Props, keyof (Applied & P)>>,
    FulfilledCurriedBuilder<Props, Applied & P, Terminal>,
    UnfulfilledCurriedBuilder<Props, Applied & P, Terminal>
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

export function createCurriedBuilder<T extends object>(): CurriedBuilder<T, T>;
export function createCurriedBuilder<T extends object, U>(
  terminalOp: (props: T) => U
): CurriedBuilder<T, U>;
export function createCurriedBuilder<T extends object, U>(
  terminalOp?: (props: T) => U
) {
  if (terminalOp === undefined) {
    return builderImpl<T, T>((props) => props);
  } else {
    return builderImpl<T, U>(terminalOp);
  }
}
