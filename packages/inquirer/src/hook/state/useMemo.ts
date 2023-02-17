import {
  assertHookValue,
  isDepsChanged,
  isInitial,
  stockHookValue,
  takeIndex,
  takeValue,
} from "../../core/hookContext";
import { useHookContext } from "../core/useHookContext";

const hookType = "useMemo";
const assertHook = assertHookValue(hookType);
const stockValue = stockHookValue(hookType);

/**
 * メモ化された値を返すhook
 * Reactとは違い、Promptの変更検知はオブジェクトのハッシュ値で行われるため、多くの場合useMemoを使う必要は無い
 * 高価な計算をメモ化する場合に使用する
 * @param factory
 * @param deps
 */
export const useMemo = <T>(factory: () => T, deps: unknown[]): T => {
  const ctx = useHookContext();

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
