import {
  assertHookValue,
  getHookContext,
  isDepsChanged,
  stockHookValue,
  takeIndex,
  takeValue,
} from "../../core/hookContext";

import type { Snowflake } from "../../adaptor";
import type { HookContext } from "../../core/hookContext";

const hookType = "useEffect";
const assertHook = assertHookValue(hookType);
const stockValue = stockHookValue(hookType);

export const useEffect = (
  callback: (messageId: Snowflake) => void | (() => void),
  deps?: readonly unknown[]
) => {
  const ctx = getHookContext();
  return useEffectWithContext(ctx)(callback, deps);
};

export const useEffectWithContext =
  (ctx: HookContext) =>
  (
    callback: (messageId: Snowflake) => void | (() => void),
    deps?: readonly unknown[]
  ) => {
    const current = takeIndex(ctx);

    assertHook(ctx, current);

    const prevDeps = takeValue<unknown[] | undefined>(ctx, current);
    const changed = isDepsChanged(prevDeps, deps);

    //前回のrender時とdepsが変わっていたらcb実行を予約
    if (changed) {
      const renderIndex = ctx.renderIndex;
      ctx.mountHooks[renderIndex].push((message) => {
        const clean = callback(message);

        if (clean !== undefined) {
          ctx.unmountHooks[renderIndex].push(clean);
        }
      });
    }

    stockValue(ctx, current, deps);
  };
