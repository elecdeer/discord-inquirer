import { describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import {
  createAdaptorUserInvokedInteractionBaseMock,
  createDiscordAdaptorMock,
} from "../../mock";
import { useStringSelectEvent } from "./useStringSelectEvent";

import type { AdaptorStringSelectInteraction } from "../../adaptor";

describe("packages/inquirer/src/hook/useStringSelectEvent", () => {
  describe("useStringSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useStringSelectEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      const interactionMock = {
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "stringSelect",
          customId: "customId",
          values: ["value1", "value2"],
        },
      } satisfies AdaptorStringSelectInteraction;
      adaptorMock.emitInteraction!(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        ["value1", "value2"],
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

      useStringSelectEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "stringSelect",
          customId: "customIdUnMatch",
          values: [],
        },
      });

      adaptorMock.emitInteraction!({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId",
        },
      });

      expect(handle).not.toHaveBeenCalled();

      controller.unmount();
    });
  });
});
