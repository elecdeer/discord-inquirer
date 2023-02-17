import { useState } from "./useState";

/**
 * 状態変数とそれを更新する関数を返すhook
 * 状態遷移をreducerで表現する
 * @param reducer 状態遷移を表現する関数
 * @param initialState 初期状態
 */
export const useReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [S, (action: A) => void] => {
  const [state, setState] = useState(initialState);

  const dispatch = (action: A) => {
    setState((prev) => reducer(prev, action));
  };

  return [state, dispatch];
};
