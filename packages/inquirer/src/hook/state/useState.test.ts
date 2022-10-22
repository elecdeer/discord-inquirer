import { afterEach, describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";
import { useState } from "./useState";

describe("packages/inquirer/src/hook/useState", () => {
  describe("useState()", () => {
    let controller: ReturnType<typeof createHookContext> | undefined;

    afterEach(() => {
      try {
        controller?.endRender();
      } catch (e) {
        // skip
      }
    });

    test("初期値が保持される", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

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

      controller.close();
    });

    test("setStateで正しく状態が保存される", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

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

      controller.close();
    });

    test("setStateの呼び出しでdispatchが呼ばれる", () => {
      const dispatch = vi.fn();
      controller = createHookContext(createDiscordAdaptorMock(), dispatch);

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

      controller.close();
    });

    test("context外で呼び出すとエラーになる", () => {
      expect(() => {
        useState(0);
      }).toThrowError();
    });
  });
});
