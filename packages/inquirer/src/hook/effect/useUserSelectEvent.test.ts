import { describe, expect, test, vi } from "vitest";

import { useUserSelectEvent } from "./useUserSelectEvent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/effect/useUserSelectEvent", () => {
  describe("useUserSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", async () => {
      const handle = vi.fn();
      const { interactionHelper } = await renderHook(() =>
        useUserSelectEvent("customId", handle),
      );

      const interaction = await interactionHelper.emitUserSelectInteraction(
        "customId",
        2,
      );

      expect(handle).toBeCalledWith(
        interaction,
        expect.arrayContaining([
          {
            ...interaction.data.resolved.users[interaction.data.values[0]],
            member:
              interaction.data.resolved.members[interaction.data.values[0]],
          },
          {
            ...interaction.data.resolved.users[interaction.data.values[1]],
            member:
              interaction.data.resolved.members[interaction.data.values[1]],
          },
        ]),
        expect.anything(),
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", async () => {
      const handle = vi.fn();
      const { interactionHelper } = await renderHook(() =>
        useUserSelectEvent("customId", handle),
      );

      await interactionHelper.emitUserSelectInteraction("unmatchedCustomId", 2);
      await interactionHelper.emitButtonInteraction("customId");

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
