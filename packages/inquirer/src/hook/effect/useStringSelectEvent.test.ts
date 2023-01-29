import { describe, expect, test, vi } from "vitest";

import { useStringSelectEvent } from "./useStringSelectEvent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useStringSelectEvent", () => {
  describe("useStringSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const handle = vi.fn();
      const { interactionHelper } = renderHook(() =>
        useStringSelectEvent("customId", handle)
      );

      const interaction = interactionHelper.emitStringSelectInteraction(
        "customId",
        ["value1", "value2"]
      );

      expect(handle).toBeCalledWith(
        interaction,
        ["value1", "value2"],
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { interactionHelper } = renderHook(() =>
        useStringSelectEvent("customId", handle)
      );

      interactionHelper.emitStringSelectInteraction("unmatchedCustomId", [
        "value1",
        "value2",
      ]);
      interactionHelper.emitButtonInteraction("customId");

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
