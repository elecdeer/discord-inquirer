import { describe, expect, test, vi } from "vitest";

import {
  useUserSelectComponent,
  useUserSingleSelectComponent,
} from "./useUserSelectComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useUserSelectComponent", () => {
  describe("useUserSelectComponent()", () => {
    test("初期状態ではどのオプションも選択されていない", () => {
      const { result } = renderHook(() => useUserSelectComponent());

      expect(result.current[0]).toEqual([]);
    });

    test("オプションが選択されるとonSelectが呼ばれる", async () => {
      const handle = vi.fn();
      const { result, interactionHelper, waitFor } = renderHook(() =>
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

      await waitFor(() => expect(handle).toBeCalledTimes(1));

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
      const { result, interactionHelper, waitFor } = renderHook(() =>
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

      await waitFor(() =>
        expect(result.current[0]).toEqual([
          expect.objectContaining({
            username: "foo",
          }),
          expect.objectContaining({
            username: "bar",
          }),
        ])
      );
    });

    test("最小選択数と最大選択数の指定がコンポーネントデータに含まれる", async () => {
      const { result } = renderHook(() =>
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
  });

  describe("useMentionableSingleSelectComponent()", () => {
    test("最大選択数が1のコンポーネントが生成される", () => {
      const { result } = renderHook(() => useUserSingleSelectComponent());

      const component = result.current[1]();
      expect(component).toEqual(
        expect.objectContaining({
          maxValues: 1,
        })
      );
    });
  });
});
