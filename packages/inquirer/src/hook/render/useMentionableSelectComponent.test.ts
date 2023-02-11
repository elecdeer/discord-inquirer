import { describe, expect, test, vi } from "vitest";

import {
  useMentionableSelectComponent,
  useMentionableSingleSelectComponent,
} from "./useMentionableSelectComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useMentionableSelectComponent", () => {
  describe("useMentionableSelectComponent()", () => {
    test("初期状態ではどのオプションも選択されていない", async () => {
      const { result } = await renderHook(() =>
        useMentionableSelectComponent()
      );

      expect(result.current[0]).toEqual([]);
    });

    test("オプションが選択されるとonSelectが呼ばれる", async () => {
      const handle = vi.fn();
      const { result, interactionHelper } = await renderHook(() =>
        useMentionableSelectComponent({
          onSelected: handle,
        })
      );

      const component = result.current[1]();

      await interactionHelper.selectMentionableSelectComponent(component, [
        {
          type: "user",
          username: "foo",
        },
        {
          type: "role",
          name: "bar",
        },
      ]);
      expect(handle).toBeCalledTimes(1);

      expect(handle).toBeCalledWith([
        expect.objectContaining({
          type: "user",
          username: "foo",
        }),
        expect.objectContaining({
          type: "role",
          name: "bar",
        }),
      ]);
    });

    test("オプションが選択されると選択状態が更新される", async () => {
      const { result, interactionHelper } = await renderHook(() =>
        useMentionableSelectComponent()
      );

      const component = result.current[1]();
      await interactionHelper.selectMentionableSelectComponent(component, [
        {
          type: "user",
          username: "foo",
        },
        {
          type: "role",
          name: "bar",
        },
      ]);

      expect(result.current[0]).toEqual([
        expect.objectContaining({
          type: "user",
          username: "foo",
        }),
        expect.objectContaining({
          type: "role",
          name: "bar",
        }),
      ]);
    });

    test("最小選択数と最大選択数の指定がコンポーネントデータに含まれる", async () => {
      const { result } = await renderHook(() =>
        useMentionableSelectComponent({
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
    test("最大選択数が1のコンポーネントが生成される", async () => {
      const { result } = await renderHook(() =>
        useMentionableSingleSelectComponent()
      );

      const component = result.current[1]();
      expect(component).toEqual(
        expect.objectContaining({
          maxValues: 1,
        })
      );
    });
  });
});
