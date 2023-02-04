import { describe, expect, test, vi } from "vitest";

import { useButtonComponent } from "./useButtonComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useButtonComponent", () => {
  describe("useButtonComponent()", () => {
    test("クリック時にonClickとdeferUpdateが呼ばれる", async () => {
      const handle = vi.fn();
      const { result, adaptorMock, act, interactionHelper, waitFor } =
        renderHook(() =>
          useButtonComponent({
            onClick: handle,
          })
        );

      const component = result.current();

      act(() => {
        interactionHelper.clickButtonComponent(component);
      });

      await waitFor(() =>
        expect(adaptorMock.sendInteractionResponse).toHaveBeenCalledOnce()
      );
      await waitFor(() =>
        expect(adaptorMock.sendInteractionResponse).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          {
            type: "deferredUpdateMessage",
          }
        )
      );
      await waitFor(() => expect(handle).toHaveBeenCalledOnce());
    });
  });
});
