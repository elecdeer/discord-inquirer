import { afterEach, describe, expect, test, vi } from "vitest";

import { useState } from "./useState";
import { createHookCycle } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";

describe("packages/inquirer/src/hook/useState", () => {
  describe("useState()", () => {
    let controller: ReturnType<typeof createHookCycle> | undefined;

    afterEach(() => {
      try {
        controller?.endRender();
      } catch (e) {
        // skip
      }
    });

    test("初期値が保持される", () => {
      controller = createHookCycle(createDiscordAdaptorMock(), vi.fn());

      {
        controller.startRender();
        const [state] = useState(3);
        expect(state).toBe(3);
        controller.endRender();
      }

      {
        controller.startRender();
        const [state] = useState(10);
        expect(state).toBe(3);
        controller.endRender();
      }
    });

    test("setStateで正しく状態が保存される", () => {
      controller = createHookCycle(createDiscordAdaptorMock(), vi.fn());

      {
        controller.startRender();
        const [state, setState] = useState(2);
        setState(3);
        expect(state).toBe(2);

        controller.endRender();
      }

      {
        controller.startRender();
        const [state, setState] = useState(2);
        expect(state).toBe(3);
        setState((prev) => prev + 2);
        setState((prev) => prev + 3);
        expect(state).toBe(3);
        controller.endRender();
      }

      {
        controller.startRender();
        const [state] = useState(2);
        expect(state).toBe(3 + 2 + 3);
        controller.endRender();
      }
    });

    test("setStateの呼び出しでdispatchが呼ばれる", () => {
      const dispatch = vi.fn();
      controller = createHookCycle(createDiscordAdaptorMock(), dispatch);

      {
        controller.startRender();
        const [_, setState] = useState(2);
        setState(3);
        expect(dispatch).toHaveBeenCalledTimes(1);
        controller.endRender();
      }

      {
        controller.startRender();
        const [_, setState] = useState(2);
        setState((prev) => prev + 2);
        expect(dispatch).toHaveBeenCalledTimes(2);
        controller.endRender();
      }
    });

    test("context外で呼び出すとエラーになる", () => {
      expect(() => {
        useState(0);
      }).toThrowError();
    });
  });
});
