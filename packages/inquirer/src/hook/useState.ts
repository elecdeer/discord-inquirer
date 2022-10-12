import { assertHookValue, getHookContext } from "../core/hookContext";
import { resolveLazy } from "../util/lazy";

import type { HookContext } from "../core/hookContext";
import type { Lazy } from "../util/lazy";

const hookType = "useState";
const assertHook = assertHookValue(hookType);

export const useState = <T>(initial: Lazy<T>) => {
  const ctx = getHookContext();
  return useStateWithContext(ctx)(initial);
};

export const useStateWithContext =
  (ctx: HookContext) =>
  <T>(initial: Lazy<T>): [T, (dispatch: Lazy<T, T>) => void] => {
    const current = ctx.index;
    ctx.index++;

    assertHook(ctx, current);

    //前の値が無いなら初期化
    if (!(current in ctx.hookValues)) {
      ctx.hookValues[current] = {
        value: resolveLazy(initial),
        hookType: hookType,
        index: current,
      };
    }

    const prevValue = ctx.hookValues[current].value as T;
    return [
      prevValue,
      (dispatchValue: Lazy<T, T>) => {
        const nextValue = resolveLazy(dispatchValue, prevValue);

        if (Object.is(prevValue, nextValue)) {
          return;
        }

        ctx.hookValues[current] = {
          value: nextValue,
          hookType: hookType,
          index: current,
        };
        ctx.dispatch();
      },
    ];
  };
