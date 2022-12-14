import { describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";
import { useRef } from "./useRef";

describe("packages/inquirer/src/hook/useRef", () => {
  describe("useRef()", () => {
    test("値を保持する", () => {
      const controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      {
        controller.startRender();
        const ref = useRef(3);
        expect(ref.current).toBe(3);
        controller.endRender();
      }

      {
        controller.startRender();
        const ref = useRef(10);
        expect(ref.current).toBe(3);
        ref.current = 20;
        controller.endRender();
      }

      {
        controller.startRender();
        const ref = useRef(10);
        expect(ref.current).toBe(20);
        controller.endRender();
      }
    });

    test("値を変更してもdispatchは呼ばれない", () => {
      const dispatch = vi.fn();
      const controller = createHookContext(
        createDiscordAdaptorMock(),
        dispatch
      );

      {
        controller.startRender();
        const ref = useRef(3);
        ref.current = 10;

        controller.endRender();
      }

      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
