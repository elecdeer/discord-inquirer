import { describe, expect, test, vi } from "vitest";

import { useObserveValue } from "./useObserveValue";
import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";
import { useState } from "../state/useState";

describe("packages/inquirer/src/hook/effect/useObserveValue", () => {
  describe("useObserveValue()", () => {
    test("返り値の関数で変更がマークされたとき、mount後にhandlerが呼ばれる", () => {
      const controller = createHookContext(createDiscordAdaptorMock(), () => {
        // noop
      });

      const handler = vi.fn();

      controller.startRender();
      const [state, setState] = useState(3);
      const markUpdate = useObserveValue(state, handler);
      controller.endRender();
      controller.mount("messageId-0");

      //something event...
      setState(10);
      markUpdate();

      expect(handler).not.toBeCalled();

      controller.startRender();
      const [state2, __] = useState(3);
      useObserveValue(state2, handler);

      controller.endRender();
      controller.update("messageId-0");

      expect(handler).toHaveBeenCalledWith(10);
    });

    test("変更がマークされなかった時はhandlerが呼ばれない", () => {
      const controller = createHookContext(createDiscordAdaptorMock(), () => {
        // noop
      });

      const handler = vi.fn();

      controller.startRender();
      const [state, setState] = useState(3);
      useObserveValue(state, handler);
      controller.endRender();
      controller.mount("messageId-0");

      setState(10);

      controller.startRender();
      const [state2, __] = useState(3);
      useObserveValue(state2, handler);

      controller.endRender();
      controller.update("messageId-0");

      expect(handler).not.toBeCalled();
    });
  });
});
