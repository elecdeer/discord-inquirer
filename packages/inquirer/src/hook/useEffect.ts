import { assertHookValue, getHookContext } from "../core/hookContext";

import type { Snowflake } from "../adaptor";
import type { HookContext } from "../core/hookContext";

const hookType = "useEffect";
const assertHook = assertHookValue(hookType);

export const useEffect = (
  callback: (messageId: Snowflake) => void | (() => void),
  deps?: unknown[]
) => {
  const ctx = getHookContext();
  return useEffectWithContext(ctx)(callback, deps);
};

export const useEffectWithContext =
  (ctx: HookContext) =>
  (
    callback: (messageId: Snowflake) => void | (() => void),
    deps?: unknown[]
  ) => {
    const current = ctx.index;
    ctx.index++;

    assertHook(ctx, current);

    const prevDeps = ctx.hookValues[current]?.value as unknown[] | undefined;
    const changed =
      prevDeps === undefined ||
      deps === undefined ||
      deps.some((dep, i) => !Object.is(dep, prevDeps[i]));

    if (changed) {
      //前回のrender時とdepsが変わっていたらcb実行を予約
      ctx.mountHooks.push((message) => {
        const clean = callback(message);

        if (clean !== undefined) {
          ctx.unmountHooks.push(clean);
        }
      });
    }

    ctx.hookValues[current] = {
      value: deps,
      hookType: hookType,
      index: current,
    };
  };
