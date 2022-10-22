import { useState } from "./useState";

export const useReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [S, (action: A) => void] => {
  const [state, setState] = useState(initialState);

  const dispatch = (action: A) => {
    setState(reducer(state, action));
  };

  return [state, dispatch];
};
