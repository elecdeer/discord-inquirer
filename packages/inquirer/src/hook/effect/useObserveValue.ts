import { useEffect } from "./useEffect";
import { useRef } from "../state/useRef";

import type { Awaitable } from "../../util/types";

/**
 * 値の変更を監視するためのhook
 * 変更をマークすることで、次のレンダリング時にonChangedを呼ぶようになる
 * @param value 監視する値
 * @param onChanged 値が変更されたときに呼び出される関数
 * @returns 値の変更をマークする関数
 */
export const useObserveValue = <T>(
  value: T,
  onChanged: ((value: T) => Awaitable<void>) | undefined
) => {
  const valueChanged = useRef(false);
  useEffect(() => {
    if (valueChanged.current) {
      //setStateによって引き起こされるrenderのときにonChangedを呼ぶ必要がある
      void onChanged?.(value);

      valueChanged.current = false;
    }
  }, [value, onChanged]);

  return () => {
    //markUpdate
    valueChanged.current = true;
  };
};
