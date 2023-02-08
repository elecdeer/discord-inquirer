import { describe, expect, test, vi } from "vitest";

import { useConfirmButtonComponent } from "./useConfirmButtonComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useConfirmButtonComponent", () => {
  describe("useConfirmButtonComponent()", () => {
    test("初期状態ではcheckedとokはfalse", () => {
      const { result } = renderHook(() =>
        useConfirmButtonComponent({
          validate: () => ({
            ok: true,
          }),
        })
      );

      expect(result.current[0]).toEqual({
        checked: false,
        ok: false,
      });
    });

    test("ボタンがクリックされるとvalidateが呼ばれ、checkedがtrueになる", async () => {
      const handle = vi.fn(() => ({
        ok: true,
      }));

      const { result, interactionHelper, waitFor } = renderHook(() =>
        useConfirmButtonComponent({
          validate: handle,
        })
      );

      const component = result.current[1]({
        style: "success",
      })();
      interactionHelper.clickButtonComponent(component);

      await waitFor(() => expect(handle).toBeCalledTimes(1));

      expect(result.current[0]).toEqual({
        checked: true,
        ok: true,
      });
    });

    test("validate結果がvalidateResultに反映される", () => {
      const { result, rerender, interactionHelper, waitFor } = renderHook(
        (ok: boolean) =>
          useConfirmButtonComponent({
            validate: () => ({
              ok: ok,
            }),
          }),
        {
          initialArgs: false,
        }
      );

      interactionHelper.clickButtonComponent(
        result.current[1]({
          style: "success",
        })()
      );

      waitFor(() =>
        expect(result.current[0]).toEqual({
          checked: true,
          ok: false,
        })
      );

      rerender({
        newArgs: true,
      });

      interactionHelper.clickButtonComponent(
        result.current[1]({
          style: "success",
        })()
      );

      waitFor(() =>
        expect(result.current[0]).toEqual({
          checked: true,
          ok: true,
        })
      );
    });
  });
});
