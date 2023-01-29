import { describe, expect, test, vi } from "vitest";

import { useChannelSelectEvent } from "./useChannelSelectEvent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/effect/useChannelSelectEvent", () => {
  describe("useChannelSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const handle = vi.fn();
      const { interactionHelper } = renderHook(() =>
        useChannelSelectEvent("customId", handle)
      );

      const interaction = interactionHelper.emitChannelSelectInteraction(
        "customId",
        ["guildText", "publicThread"]
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

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { interactionHelper } = renderHook(() =>
        useChannelSelectEvent("customId", handle)
      );

      interactionHelper.emitChannelSelectInteraction("unmatchedCustomId", [
        "guildText",
        "publicThread",
      ]);
      interactionHelper.emitButtonInteraction("customId");

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
