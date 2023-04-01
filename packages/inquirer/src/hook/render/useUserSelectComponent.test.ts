import { describe, expect, test, vi } from "vitest";

import {
  useUserSelectComponent,
  useUserSingleSelectComponent,
} from "./useUserSelectComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useUserSelectComponent", () => {
  describe("useUserSelectComponent()", () => {
    test("初期状態ではどのオプションも選択されていない", async () => {
      const { result } = await renderHook(() => useUserSelectComponent());

      expect(result.current[0]).toEqual([]);
    });

    test("オプションが選択されるとonSelectが呼ばれる", async () => {
      const handle = vi.fn();
      const { result, interactionHelper } = await renderHook(() =>
        useUserSelectComponent({
          onSelected: handle,
        })
      );

      const component = result.current[1]();
      await interactionHelper.selectUserSelectComponent(component, [
        {
          username: "foo",
        },
        {
          username: "bar",
        },
      ]);

      expect(handle).toBeCalledTimes(1);

      expect(handle).toBeCalledWith([
        expect.objectContaining({
          username: "foo",
        }),
        expect.objectContaining({
          username: "bar",
        }),
      ]);
    });

    test("オプションが選択されると選択状態が更新される", async () => {
      const { result, interactionHelper } = await renderHook(() =>
        useUserSelectComponent()
      );

      const component = result.current[1]();
      await interactionHelper.selectUserSelectComponent(component, [
        {
          username: "foo",
        },
        {
          username: "bar",
        },
      ]);

      expect(result.current[0]).toEqual([
        expect.objectContaining({
          username: "foo",
        }),
        expect.objectContaining({
          username: "bar",
        }),
      ]);
    });

    test("最小選択数と最大選択数の指定がコンポーネントデータに含まれる", async () => {
      const { result } = await renderHook(() =>
        useUserSelectComponent({
          minValues: 1,
          maxValues: 2,
        })
      );

      const component = result.current[1]();
      expect(component).toEqual(
        expect.objectContaining({
          minValues: 1,
          maxValues: 2,
        })
      );
    });

    test("filterでfalseを返したときはinteractionを無視する", async () => {
      const handle = vi.fn();
      const { result, adaptorMock, interactionHelper } = await renderHook(() =>
        useUserSelectComponent({
          onSelected: handle,
          filter: (interaction) => interaction.user.id === "foo",
        })
      );

      const component = result.current[1]();

      await interactionHelper.selectUserSelectComponent(component, [
        {
          username: "bar",
        },
      ]);
      expect(adaptorMock.sendInteractionResponse).not.toHaveBeenCalled();
      expect(handle).not.toHaveBeenCalled();

      await interactionHelper.selectUserSelectComponent(
        component,
        [
          {
            username: "foo",
          },
        ],
        (base) => ({
          user: {
            ...base.user,
            id: "foo",
          },
        })
      );
      expect(adaptorMock.sendInteractionResponse).toHaveBeenCalled();
      expect(handle).toHaveBeenCalled();
    });
  });

  describe("useMentionableSingleSelectComponent()", () => {
    test("最大選択数が1のコンポーネントが生成される", async () => {
      const { result } = await renderHook(() => useUserSingleSelectComponent());

      const component = result.current[1]();
      expect(component).toEqual(
        expect.objectContaining({
          maxValues: 1,
        })
      );
    });
  });
});
