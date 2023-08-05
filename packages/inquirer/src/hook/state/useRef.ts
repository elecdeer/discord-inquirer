import { useState } from "./useState";

/**
 * ミュータブルなRefオブジェクトを返すhook
 * ref.currentに値を保持でき、更新しても再レンダリングされない
 * @param value 初期値
 */
export const useRef = <T>(
  value: T,
): {
  current: T;
} => {
  const [state] = useState<{
    current: T;
  }>({
    current: value,
  });
  return state;
};
