import { describe, expect, test, vi } from "vitest";

import {
  useSelectComponent,
  useSingleSelectComponent,
} from "./useSelectComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useSelectComponent", () => {
  describe("useSelectComponent()", () => {
    test("引数で与えたオプションのdefaultフィールドによって初期状態が決まる", () => {
      const { result } = renderHook(() =>
        useSelectComponent({
          options: [
            {
              label: "foo",
              payload: "foo",
              default: true,
            },
            {
              label: "bar",
              payload: "bar",
            },
          ],
        })
      );

      expect(result.current[0]).toEqual([
        expect.objectContaining({
          label: "foo",
          payload: "foo",
          default: true,
        }),
        expect.objectContaining({
          label: "bar",
          payload: "bar",
        }),
      ]);
    });

    test("オプションが選択されるとonSelectが呼ばれる", async () => {
      const handle = vi.fn();
      const { result, interactionHelper, waitFor } = renderHook(() =>
        useSelectComponent({
          options: [
            {
              label: "foo",
              payload: "foo",
            },
            {
              label: "bar",
              payload: "bar",
            },
          ],
          onSelected: handle,
        })
      );

      await interactionHelper.selectStringSelectComponent(
        result.current[1](),
        result.current[1]()
          .options.filter((option) => option.label === "bar")
          .map((option) => option.value)
      );

      await waitFor(() => expect(handle).toBeCalledTimes(1));

      expect(handle).toBeCalledWith([
        expect.objectContaining({
          label: "foo",
          payload: "foo",
          selected: false,
        }),
        expect.objectContaining({
          label: "bar",
          payload: "bar",
          selected: true,
        }),
      ]);
    });

    test("オプションが選択されると選択状態が更新される", async () => {
      const { result, interactionHelper, waitFor } = renderHook(() =>
        useSelectComponent({
          options: [
            {
              label: "foo",
              payload: "foo",
            },
            {
              label: "bar",
              payload: "bar",
            },
          ],
        })
      );

      await interactionHelper.selectStringSelectComponent(
        result.current[1](),
        result.current[1]()
          .options.filter((option) => option.label === "bar")
          .map((option) => option.value)
      );

      await waitFor(() =>
        expect(result.current[0]).toEqual([
          expect.objectContaining({
            label: "foo",
            payload: "foo",
            selected: false,
          }),
          expect.objectContaining({
            label: "bar",
            payload: "bar",
            selected: true,
          }),
        ])
      );
    });

    test("inactiveなオプションはコンポーネントに含まれない", async () => {
      const { result } = renderHook(() =>
        useSelectComponent({
          options: [
            {
              label: "foo",
              payload: "foo",
              inactive: true,
            },
            {
              label: "bar",
              payload: "bar",
            },
          ],
        })
      );

      expect(result.current[1]().options).toEqual([
        expect.not.objectContaining({
          label: "foo",
        }),
      ]);
    });
  });

  describe("useSingleSelectComponent()", () => {
    test("最大選択数が1のコンポーネントが生成される", () => {
      const { result } = renderHook(() =>
        useSingleSelectComponent({
          options: [
            {
              label: "foo",
              payload: "foo",
            },
            {
              label: "bar",
              payload: "bar",
            },
          ],
        })
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
