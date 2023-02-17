import { useState } from "./useState";
import { resolveLazy } from "../../util/lazy";

import type { Lazy } from "../../util/lazy";

/**
 * MapのようなKey-Valueの状態を保持するhook
 * @param initialState 初期値
 */
export const useCollection = <K, V>(
  initialState: Lazy<Map<K, V> | [K, V][]>
) => {
  const [mapState, setMapState] = useState<Map<K, V>>(
    new Map(resolveLazy(initialState))
  );

  const set = (key: K, value: Lazy<V, V | undefined>) => {
    setMapState((prev) => {
      const prevValue = prev.get(key);
      const nextValue = resolveLazy(value, prevValue);

      if (Object.is(prevValue, nextValue)) {
        return prev;
      }

      const next = new Map(prev);
      next.set(key, nextValue);
      return next;
    });
  };

  const setEach = (fn: (prevValue: V, key: K) => V) => {
    setMapState((prev) => {
      const next = new Map(prev);

      let updated = false;
      for (const [key, prevValue] of prev) {
        const nextValue = fn(prevValue, key);
        if (Object.is(prevValue, nextValue)) {
          continue;
        }
        updated = true;
        next.set(key, nextValue);
      }

      if (updated) {
        return next;
      } else {
        return prev;
      }
    });
  };

  const get = (key: K): V | undefined => mapState.get(key);

  const remove = (key: K) => {
    setMapState((prev) => {
      if (!prev.has(key)) {
        return prev;
      }

      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const reset = () => {
    setMapState(new Map(resolveLazy(initialState)));
  };

  const values = () => Array.from(mapState.values());
  const map = (): ReadonlyMap<K, V> => new Map(mapState);

  return {
    set,
    setEach,
    get,
    remove,
    reset,
    values,
    map,
  };
};
