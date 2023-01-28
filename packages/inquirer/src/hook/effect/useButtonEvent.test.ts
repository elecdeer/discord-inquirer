import { describe, expect, test, vi } from "vitest";

import { useButtonEvent } from "./useButtonEvent";
import {
  createAdaptorUserInvokedInteractionBaseMock,
  renderHook,
} from "../../testing";

import type {
  AdaptorButtonInteraction,
  AdaptorUserSelectInteraction,
} from "../../adaptor";

describe("packages/inquirer/src/hook/useButtonEvent", () => {
  describe("useButtonEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useButtonEvent("customId", handle)
      );

      const interactionMock = {
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId",
        },
      } as const satisfies AdaptorButtonInteraction;
      emitInteraction(interactionMock);

      expect(handle).toBeCalledWith(interactionMock, expect.anything());
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useButtonEvent("customId", handle)
      );

      emitInteraction({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId2",
        },
      });

      emitInteraction!({
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
    });
  });
});
