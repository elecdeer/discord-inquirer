import {
  assertHookValue,
  isDepsChanged,
  stockHookValue,
  takeIndex,
  takeValue,
} from "../../core/hookContext";
import { useHookContext } from "../core/useHookContext";

import type { Snowflake } from "../../adaptor";

const hookType = "useEffect";
const assertHook = assertHookValue(hookType);
const stockValue = stockHookValue(hookType);

/**
 * 副作用を実行するhook
 * callbackはDiscordのメッセージが編集された後に実行される
 * @param callback
 * @param deps
 */
export const useEffect = (
  callback: (messageId: Snowflake) => void | (() => void),
  deps?: readonly unknown[]
): void => {
  const ctx = useHookContext();

  const current = takeIndex(ctx);

  assertHook(ctx, current);

  const prevDeps = takeValue<unknown[] | undefined>(ctx, current);
  const changed = isDepsChanged(prevDeps, deps);

  //前回のrender時とdepsが変わっていたらcb実行を予約
  if (changed) {
    ctx.mountHooks.push((message) => {
      const clean = callback(message);

      if (clean !== undefined) {
        ctx.unmountHooks.push(clean);
      }
    });
  }

  stockValue(ctx, current, deps);
};
