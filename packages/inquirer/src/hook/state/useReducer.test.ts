import { describe, expect, test } from "vitest";

import { useReducer } from "./useReducer";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useReducer", () => {
  describe("useReducer()", () => {
    test("actionによって状態が遷移する", async () => {
      const reducer = (
        state: number,
        action: { type: "increment" | "decrement" },
      ) => {
        switch (action.type) {
          case "increment":
            return state + 1;
          case "decrement":
            return state - 1;
        }
      };

      const { result, act } = await renderHook(() => {
        const [value, dispatch] = useReducer(reducer, 0);
        return {
          value,
          dispatch,
        };
      });

      expect(result.current.value).toBe(0);

      await act(() => {
        result.current.dispatch({ type: "increment" });
      });

      expect(result.current.value).toBe(1);

      await act(() => {
        result.current.dispatch({ type: "decrement" });
        result.current.dispatch({ type: "decrement" });
      });

      expect(result.current.value).toBe(-1);
    });
  });
});
