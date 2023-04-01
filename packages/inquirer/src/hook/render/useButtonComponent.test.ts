import { describe, expect, test, vi } from "vitest";

import { useButtonComponent } from "./useButtonComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useButtonComponent", () => {
  describe("useButtonComponent()", () => {
    test("クリック時にonClickとdeferUpdateが呼ばれる", async () => {
      const handle = vi.fn();
      const { result, adaptorMock, interactionHelper } = await renderHook(() =>
        useButtonComponent({
          onClick: handle,
        })
      );

      const component = result.current({
        style: "primary",
      })();
      await interactionHelper.clickButtonComponent(component);

      expect(adaptorMock.sendInteractionResponse).toHaveBeenCalledOnce();
      expect(adaptorMock.sendInteractionResponse).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        {
          type: "deferredUpdateMessage",
        }
      );

      expect(handle).toHaveBeenCalledOnce();
    });

    test("filterがfalseを返すとonClickとdeferUpdateが呼ばれない", async () => {
      const handle = vi.fn();
      const { result, adaptorMock, interactionHelper } = await renderHook(() =>
        useButtonComponent({
          onClick: handle,
          filter: (interaction) => interaction.user.id === "foo",
        })
      );

      const component = result.current({
        style: "primary",
      })();

      await interactionHelper.clickButtonComponent(component);
      expect(adaptorMock.sendInteractionResponse).not.toHaveBeenCalled();
      expect(handle).not.toHaveBeenCalled();

      await interactionHelper.clickButtonComponent(component, (base) => ({
        user: {
          ...base.user,
          id: "foo",
        },
      }));
      expect(adaptorMock.sendInteractionResponse).toHaveBeenCalled();
      expect(handle).toHaveBeenCalled();
    });
  });
});
