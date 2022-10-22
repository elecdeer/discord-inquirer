import {
  assertHookValue,
  getHookContext,
  isInitial,
  stockHookValue,
  takeIndex,
} from "../../core/hookContext";
import { resolveLazy } from "../../util/lazy";

import type { HookContext } from "../../core/hookContext";
import type { Lazy } from "../../util/lazy";

const hookType = "useState";
const assertHook = assertHookValue(hookType);
const stockValue = stockHookValue(hookType);

export const useState = <T>(initial: Lazy<T>) => {
  const ctx = getHookContext();
  return useStateWithContext(ctx)(initial);
};

export const useStateWithContext =
  (ctx: HookContext) =>
  <T>(initial: Lazy<T>): [T, (dispatch: Lazy<T, T>) => void] => {
    const current = takeIndex(ctx);

    assertHook(ctx, current);

    //前の値が無いなら初期化
    if (isInitial(ctx, current)) {
      stockValue(ctx, current, resolveLazy(initial));
    }

    return [
      ctx.hookValues[current].value as T,
      (dispatchValue: Lazy<T, T>) => {
        const prevValue = ctx.hookValues[current].value as T;
        const nextValue = resolveLazy(dispatchValue, prevValue);

        if (Object.is(prevValue, nextValue)) {
          return;
        }

        stockValue(ctx, current, nextValue);
        ctx.dispatch();
      },
    ];
  };
