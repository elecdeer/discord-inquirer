import { describe, expect, test, vi } from "vitest";

import { useReducer } from "./useReducer";
import { createHookCycle } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";

describe("packages/inquirer/src/hook/useReducer", () => {
  describe("useReducer()", () => {
    test("actionによって状態が遷移する", () => {
      const controller = createHookCycle(createDiscordAdaptorMock(), vi.fn());

      const reducer = (
        state: number,
        action: { type: "increment" | "decrement" }
      ) => {
        switch (action.type) {
          case "increment":
            return state + 1;
          case "decrement":
            return state - 1;
        }
      };

      {
        controller.startRender();
        const [state, dispatch] = useReducer(reducer, 0);

        dispatch({ type: "increment" });
        expect(state).toBe(0);
        controller.endRender();
      }

      {
        controller.startRender();
        const [state, dispatch] = useReducer(reducer, 0);
        expect(state).toBe(1);
        dispatch({ type: "decrement" });
        controller.endRender();
      }

      {
        controller.startRender();
        const [state] = useReducer(reducer, 0);
        expect(state).toBe(0);
        controller.endRender();
      }
    });
  });
});
