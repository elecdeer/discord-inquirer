import { describe, expect, test, vi } from "vitest";

import {
  useMentionableSelectComponent,
  useMentionableSingleSelectComponent,
} from "./useMentionableSelectComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useMentionableSelectComponent", () => {
  describe("useMentionableSelectComponent()", () => {
    test("初期状態ではどのオプションも選択されていない", () => {
      const { result } = renderHook(() => useMentionableSelectComponent());

      expect(result.current[0]).toEqual([]);
    });

    test("オプションが選択されるとonSelectが呼ばれる", async () => {
      const handle = vi.fn();
      const { result, interactionHelper, waitFor } = renderHook(() =>
        useMentionableSelectComponent({
          onSelected: handle,
        })
      );

      const component = result.current[1]();
      interactionHelper.selectMentionableSelectComponent(component, [
        {
          type: "user",
          username: "foo",
        },
        {
          type: "role",
          name: "bar",
        },
      ]);

      await waitFor(() => expect(handle).toBeCalledTimes(1));

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
      const { result, interactionHelper, waitFor } = renderHook(() =>
        useMentionableSelectComponent()
      );

      const component = result.current[1]();
      interactionHelper.selectMentionableSelectComponent(component, [
        {
          type: "user",
          username: "foo",
        },
        {
          type: "role",
          name: "bar",
        },
      ]);

      await waitFor(() =>
        expect(result.current[0]).toEqual([
          expect.objectContaining({
            type: "user",
            username: "foo",
          }),
          expect.objectContaining({
            type: "role",
            name: "bar",
          }),
        ])
      );
    });

    test("最小選択数と最大選択数の指定がコンポーネントデータに含まれる", async () => {
      const { result } = renderHook(() =>
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
    test("最大選択数が1のコンポーネントが生成される", () => {
      const { result } = renderHook(() =>
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
