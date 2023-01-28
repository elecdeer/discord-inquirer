import { describe, expect, test, vi } from "vitest";

import { useStringSelectEvent } from "./useStringSelectEvent";
import {
  createAdaptorUserInvokedInteractionBaseMock,
  renderHook,
} from "../../testing";

import type { AdaptorStringSelectInteraction } from "../../adaptor";

describe("packages/inquirer/src/hook/useStringSelectEvent", () => {
  describe("useStringSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useStringSelectEvent("customId", handle)
      );

      const interactionMock = {
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "stringSelect",
          customId: "customId",
          values: ["value1", "value2"],
        },
      } satisfies AdaptorStringSelectInteraction;
      emitInteraction(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        ["value1", "value2"],
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useStringSelectEvent("customId", handle)
      );

      emitInteraction({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "stringSelect",
          customId: "customIdUnMatch",
          values: [],
        },
      });

      emitInteraction({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId",
        },
      });

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
