import { describe, expect, test, vi } from "vitest";

import { createDiscordAdaptorMock } from "../adaptor";
import { createHookContext } from "../core/hookContext";
import { useSelectMenuEvent } from "./useSelectMenuEvent";

describe("packages/inquirer/src/hook/useSelectMenuEvent", () => {
  describe("useSelectMenuEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useSelectMenuEvent("customId", handle);

      controller.afterMount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        type: "messageComponent",
        id: "interactionId",
        token: "interactionToken",
        userId: "userId",
        data: {
          componentType: "selectMenu",
          customId: "customId",
          values: ["value1", "value2"],
        },
      });

      expect(handle).toBeCalledWith("interactionId", ["value1", "value2"]);
      expect(handle).toBeCalledTimes(1);

      controller.close();
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useSelectMenuEvent("customId", handle);

      controller.afterMount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        type: "messageComponent",
        id: "interactionId",
        token: "interactionToken",
        userId: "userId",
        data: {
          componentType: "selectMenu",
          customId: "customIdUnMatch",
          values: [],
        },
      });

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

      expect(handle).not.toHaveBeenCalled();

      controller.close();
    });
  });
});
