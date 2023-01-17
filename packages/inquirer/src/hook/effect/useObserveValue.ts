import { useEffect } from "./useEffect";
import { useRef } from "../state/useRef";

import type { Awaitable } from "../../util/types";

export const useObserveValue = <T>(
  value: T,
  onChanged: ((value: T) => Awaitable<void>) | undefined
) => {
  const valueChanged = useRef(false);
  useEffect(() => {
    if (valueChanged.current) {
      //setStateによって引き起こされるrenderのときにonChangedを呼ぶ必要がある
      onChanged?.(value);
      valueChanged.current = false;
    }
  }, [value, onChanged]);

  return () => {
    //markUpdate
    valueChanged.current = true;
  };
};
