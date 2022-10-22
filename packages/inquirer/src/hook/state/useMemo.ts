import {
  assertHookValue,
  getHookContext,
  isDepsChanged,
  isInitial,
  stockHookValue,
  takeIndex,
  takeValue,
} from "../../core/hookContext";

import type { HookContext } from "../../core/hookContext";

const hookType = "useMemo";
const assertHook = assertHookValue(hookType);
const stockValue = stockHookValue(hookType);

export const useMemo = <T>(factory: () => T, deps: unknown[]): T => {
  const ctx = getHookContext();
  return useMemoWithContext(ctx)(factory, deps);
};

export const useMemoWithContext =
  (ctx: HookContext) =>
  <T>(factory: () => T, deps: unknown[]): T => {
    type StockValue = {
      value: T;
      deps: unknown[];
    };

    const current = takeIndex(ctx);

    assertHook(ctx, current);

    const prevDeps = takeValue<StockValue | undefined>(ctx, current)?.deps;
    const changed = isDepsChanged(prevDeps, deps);

    const initial = isInitial(ctx, current);
    if (initial || changed) {
      stockValue(ctx, current, {
        value: factory(),
        deps,
      });
    }

    return takeValue<StockValue>(ctx, current).value;
  };
