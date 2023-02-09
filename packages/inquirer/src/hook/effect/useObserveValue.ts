import { useEffect } from "./useEffect";
import { batchDispatchAsync } from "../../core/hookContext";
import { useHookContext } from "../core/useHookContext";
import { useRef } from "../state/useRef";

import type { Awaitable } from "../../util/types";

export const useObserveValue = <T>(
  value: T,
  onChanged: ((value: T) => Awaitable<void>) | undefined
) => {
  const ctx = useHookContext();

  const valueChanged = useRef(false);
  useEffect(() => {
    if (valueChanged.current) {
      //setStateによって引き起こされるrenderのときにonChangedを呼ぶ必要がある
      void batchDispatchAsync(ctx, async () => {
        await onChanged?.(value);
      });

      valueChanged.current = false;
    }
  }, [value, onChanged]);

  return () => {
    //markUpdate
    valueChanged.current = true;
  };
};
