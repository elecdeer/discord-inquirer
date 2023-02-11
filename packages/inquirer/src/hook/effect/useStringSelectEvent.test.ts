import { describe, expect, test, vi } from "vitest";

import { useStringSelectEvent } from "./useStringSelectEvent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useStringSelectEvent", () => {
  describe("useStringSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", async () => {
      const handle = vi.fn();
      const { interactionHelper } = await renderHook(() =>
        useStringSelectEvent("customId", handle)
      );

      const interaction = await interactionHelper.emitStringSelectInteraction(
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

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", async () => {
      const handle = vi.fn();
      const { interactionHelper } = await renderHook(() =>
        useStringSelectEvent("customId", handle)
      );

      await interactionHelper.emitStringSelectInteraction("unmatchedCustomId", [
        "value1",
        "value2",
      ]);
      await interactionHelper.emitButtonInteraction("customId");

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
