import { describe, expect, test, vi } from "vitest";

import { useRoleSelectEvent } from "./useRoleSelectEvent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/effect/useRoleSelectEvent", () => {
  describe("useRoleSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", async () => {
      const handle = vi.fn();
      const { interactionHelper } = await renderHook(() =>
        useRoleSelectEvent("customId", handle)
      );

      const interaction = await interactionHelper.emitRoleSelectInteraction(
        "customId",
        2
      );

      expect(handle).toBeCalledWith(
        interaction,
        expect.arrayContaining([
          interaction.data.resolved.roles[interaction.data.values[0]],
          interaction.data.resolved.roles[interaction.data.values[1]],
        ]),
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", async () => {
      const handle = vi.fn();
      const { interactionHelper } = await renderHook(() =>
        useRoleSelectEvent("customId", handle)
      );

      interactionHelper.emitRoleSelectInteraction("unmatchedCustomId", 2);
      interactionHelper.emitButtonInteraction("customId");

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
