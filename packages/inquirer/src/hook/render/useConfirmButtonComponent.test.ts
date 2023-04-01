import { describe, expect, test, vi } from "vitest";

import { useConfirmButtonComponent } from "./useConfirmButtonComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useConfirmButtonComponent", () => {
  describe("useConfirmButtonComponent()", () => {
    test("初期状態ではcheckedとokはfalse", async () => {
      const { result } = await renderHook(() =>
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

      const { result, interactionHelper } = await renderHook(() =>
        useConfirmButtonComponent({
          validate: handle,
        })
      );

      const component = result.current[1]({
        style: "success",
      })();

      expect(handle).toBeCalledTimes(0);

      await interactionHelper.clickButtonComponent(component);

      expect(handle).toBeCalledTimes(1);

      expect(result.current[0]).toEqual({
        checked: true,
        ok: true,
      });
    });

    test("validate結果がvalidateResultに反映される", async () => {
      const { result, rerender, interactionHelper } = await renderHook(
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

      await interactionHelper.clickButtonComponent(
        result.current[1]({
          style: "success",
        })()
      );

      expect(result.current[0]).toEqual({
        checked: true,
        ok: false,
      });

      await rerender({
        newArgs: true,
      });

      await interactionHelper.clickButtonComponent(
        result.current[1]({
          style: "success",
        })()
      );

      expect(result.current[0]).toEqual({
        checked: true,
        ok: true,
      });
    });

    test("filterでfalseを返したときはinteractionを無視する", async () => {
      const handle = vi.fn();
      const { result, interactionHelper, adaptorMock } = await renderHook(() =>
        useConfirmButtonComponent({
          validate: () => ({
            ok: true,
          }),
          onConfirm: handle,
          filter: (interaction) => interaction.user.id === "foo",
        })
      );

      const component = result.current[1]({
        style: "success",
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
