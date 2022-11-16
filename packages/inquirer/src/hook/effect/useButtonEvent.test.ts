import { describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";
import { useButtonEvent } from "./useButtonEvent";

describe("packages/inquirer/src/hook/useButtonEvent", () => {
  describe("useButtonEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useButtonEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        type: "messageComponent",
        id: "interactionId",
        token: "interactionToken",
        userId: "userId",
        data: {
          componentType: "button",
          customId: "customId",
        },
      });

      expect(handle).toBeCalledWith(
        {
          id: "interactionId",
          token: "interactionToken",
          userId: "userId",
        },
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);

      controller.unmount();
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useButtonEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        type: "messageComponent",
        id: "interactionId",
        token: "interactionToken",
        userId: "userId",
        data: {
          componentType: "button",
          customId: "customIdUnMatch",
        },
      });

      adaptorMock.emitInteraction!({
        type: "messageComponent",
        id: "interactionId",
        token: "interactionToken",
        userId: "userId",
        data: {
          componentType: "selectMenu",
          customId: "customId",
          values: [],
        },
      });

      expect(handle).not.toHaveBeenCalled();

      controller.unmount();
    });
  });
});
