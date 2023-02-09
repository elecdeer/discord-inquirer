import {
  assertHookValue,
  isInitial,
  stockHookValue,
  takeIndex,
  takeValue,
} from "../../core/hookContext";
import { resolveLazy } from "../../util/lazy";
import { useHookContext } from "../core/useHookContext";

import type { Lazy } from "../../util/lazy";

const hookType = "useState";
const assertHook = assertHookValue(hookType);
const stockValue = stockHookValue(hookType);

export const useState = <T>(
  initial: Lazy<T>
): [T, (dispatch: Lazy<T, T>) => void] => {
  const ctx = useHookContext();
  const current = takeIndex(ctx);

  assertHook(ctx, current);

  //前の値が無いなら初期化
  if (isInitial(ctx, current)) {
    stockValue(ctx, current, resolveLazy(initial));
  }

  return [
    takeValue<T>(ctx, current),
    (dispatchValue: Lazy<T, T>) => {
      const prevValue = takeValue<T>(ctx, current);
      const nextValue = resolveLazy(dispatchValue, prevValue);

      if (Object.is(prevValue, nextValue)) {
        return;
      }

      stockValue(ctx, current, nextValue);
      ctx.dispatch();
    },
  ];
};
