import { describe, expect, test, vi } from "vitest";

import { useButtonEvent } from "./useButtonEvent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useButtonEvent", () => {
  describe("useButtonEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", async () => {
      const handle = vi.fn();
      const { interactionHelper } = renderHook(() =>
        useButtonEvent("customId", handle)
      );

      const interaction = await interactionHelper.emitButtonInteraction(
        "customId"
      );

      expect(handle).toBeCalledWith(interaction, expect.anything());
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", async () => {
      const handle = vi.fn();
      const { interactionHelper } = renderHook(() =>
        useButtonEvent("customId", handle)
      );

      await interactionHelper.emitButtonInteraction("unmatchedCustomId");
      await interactionHelper.emitUserSelectInteraction("customId", 1);

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
