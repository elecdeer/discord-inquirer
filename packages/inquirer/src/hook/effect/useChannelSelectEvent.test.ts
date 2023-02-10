import { describe, expect, test, vi } from "vitest";

import { useChannelSelectEvent } from "./useChannelSelectEvent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/effect/useChannelSelectEvent", () => {
  describe("useChannelSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", async () => {
      const handle = vi.fn();
      const { interactionHelper } = await renderHook(() =>
        useChannelSelectEvent("customId", handle)
      );

      const interaction = await interactionHelper.emitChannelSelectInteraction(
        "customId",
        [{ type: "guildText" }, { type: "publicThread" }]
      );

      expect(handle).toBeCalledWith(
        interaction,
        expect.arrayContaining(
          Object.values(interaction.data.resolved.channels)
        ),
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", async () => {
      const handle = vi.fn();
      const { interactionHelper } = await renderHook(() =>
        useChannelSelectEvent("customId", handle)
      );

      interactionHelper.emitChannelSelectInteraction("unmatchedCustomId", [
        { type: "guildText" },
        { type: "publicThread" },
      ]);
      interactionHelper.emitButtonInteraction("customId");

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
