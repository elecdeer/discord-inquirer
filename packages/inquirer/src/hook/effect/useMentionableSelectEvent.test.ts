import { describe, expect, test, vi } from "vitest";

import { useMentionableSelectEvent } from "./useMentionableSelectEvent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/effect/useMentionableSelectEvent", () => {
  describe("useMentionableSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", async () => {
      const handle = vi.fn();
      const { interactionHelper } = renderHook(() =>
        useMentionableSelectEvent("customId", handle)
      );

      const interaction =
        await interactionHelper.emitMentionableSelectInteraction("customId", [
          { type: "user" },
          { type: "role" },
        ]);

      expect(handle).toBeCalledWith(
        interaction,
        expect.arrayContaining([
          {
            type: "user",
            ...interaction.data.resolved.users[interaction.data.values[0]],
          },
          {
            type: "role",
            ...interaction.data.resolved.roles[interaction.data.values[1]],
          },
        ]),
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { interactionHelper } = renderHook(() =>
        useMentionableSelectEvent("customId", handle)
      );

      interactionHelper.emitButtonInteraction("customId");
      interactionHelper.emitMentionableSelectInteraction("unmatchedCustomId", [
        { type: "user" },
        { type: "role" },
      ]);

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
