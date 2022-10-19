import { resolveLazy } from "../util/lazy";
import { useState } from "./useState";

import type { Lazy } from "../util/lazy";

export const useMap = <T extends object>(initial: T) => {
  const [map, setMap] = useState<T>(initial);

  const get = <K extends keyof T>(key: K) => map[key];

  const set = <K extends keyof T>(key: K, value: Lazy<T[K], T[K]>) => {
    setMap((prev) => ({ ...prev, [key]: resolveLazy(value, prev[key]) }));
  };

  const setAll = (value: Lazy<T, T>) => {
    setMap((prev) => resolveLazy(value, prev));
  };

  const remove = (key: keyof T) => {
    setMap((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest as T;
    });
  };

  const reset = () => {
    setMap(initial);
  };

  return { map, get, set, setAll, remove, reset };
};
