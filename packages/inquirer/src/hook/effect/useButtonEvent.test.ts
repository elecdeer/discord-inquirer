import { describe, expect, test, vi } from "vitest";

import { useButtonEvent } from "./useButtonEvent";
import { createHookContext } from "../../core/hookContext";
import {
  createAdaptorUserInvokedInteractionBaseMock,
  createDiscordAdaptorMock,
} from "../../mock";

import type {
  AdaptorButtonInteraction,
  AdaptorUserSelectInteraction,
} from "../../adaptor";

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

      const interactionMock = {
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId",
        },
      } as const satisfies AdaptorButtonInteraction;
      adaptorMock.emitInteraction!(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
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
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId2",
        },
      });

      adaptorMock.emitInteraction!({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "userSelect",
          customId: "customId",
          values: ["value1", "value2"],
          resolved: {
            users: {},
            members: {},
          },
        },
      } satisfies AdaptorUserSelectInteraction);

      expect(handle).not.toHaveBeenCalled();

      controller.unmount();
    });
  });
});
