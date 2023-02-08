import { describe, expect, test, vi } from "vitest";

import { usePagedSelectComponent } from "./usePagedSelectComponent";
import { renderHook } from "../../testing";

import type { PartialSelectItem } from "./useSelectComponent";
import type { AdaptorStringSelectComponent } from "../../adaptor";

describe("packages/inquirer/src/hook/render/usePagedSelectComponent", () => {
  describe("usePagedSelectComponent()", () => {
    const createDummyOptions = (eachPageLength: number[]) => {
      const options: PartialSelectItem<unknown>[][] = [];
      for (let i = 0; i < eachPageLength.length; i++) {
        const pageOptions: PartialSelectItem<unknown>[] = [];
        for (let j = 0; j < eachPageLength[i]; j++) {
          pageOptions.push({
            key: `${i}-${j}`,
            payload: `${i}-${j}`,
            label: `${i}-${j}`,
          });
        }
        options.push(pageOptions);
      }
      return options;
    };

    test("引数で与えたオプションのdefaultフィールドによって初期状態が決まる", () => {
      const options = createDummyOptions([1, 2, 3]);
      options[0][0].default = true;
      options[2][1].default = true;

      const { result } = renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
        })
      );

      expect(result.current.result.length).toBe(6);
      expect(result.current.result).toEqual(
        expect.arrayContaining([
          // prettier-ignore
          expect.objectContaining({ key: "0-0", selected: true }),
          expect.objectContaining({ key: "1-0", selected: false }),
          expect.objectContaining({ key: "1-1", selected: false }),
          expect.objectContaining({ key: "2-0", selected: false }),
          expect.objectContaining({ key: "2-1", selected: true }),
          expect.objectContaining({ key: "2-2", selected: false }),
        ])
      );
    });

    test("ページが切り替わるとコンポーネントが更新される", () => {
      const options = createDummyOptions([1, 2, 3]);
      options[0][0].default = true;
      options[2][1].default = true;

      const { result, act } = renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
        })
      );

      expect(result.current.Select().options).toEqual([
        {
          label: "0-0",
          value: expect.any(String),
          default: true,
        },
      ] satisfies AdaptorStringSelectComponent<unknown>["options"]);

      act(() => {
        result.current.setPage(1);
      });

      expect(result.current.Select().options).toEqual([
        {
          label: "1-0",
          value: expect.any(String),
          default: false,
        },
        {
          label: "1-1",
          value: expect.any(String),
          default: false,
        },
      ] satisfies AdaptorStringSelectComponent<unknown>["options"]);

      act(() => {
        result.current.setPage((prev) => prev + 1);
      });

      expect(result.current.Select().options).toEqual([
        {
          label: "2-0",
          value: expect.any(String),
          default: false,
        },
        {
          label: "2-1",
          value: expect.any(String),
          default: true,
        },
        {
          label: "2-2",
          value: expect.any(String),
          default: false,
        },
      ] satisfies AdaptorStringSelectComponent<unknown>["options"]);
    });

    test("オプションが選択されると状態が変化する", async () => {
      const options = createDummyOptions([1, 2, 3]);
      options[0][0].default = true;
      options[2][1].default = true;

      const { result, act, interactionHelper, waitFor } = renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
        })
      );
      act(() => {
        result.current.setPage(2);
      });

      expect(result.current.Select().options).toEqual([
        {
          label: "2-0",
          value: expect.any(String),
          default: false,
        },
        {
          label: "2-1",
          value: expect.any(String),
          default: true,
        },
        {
          label: "2-2",
          value: expect.any(String),
          default: false,
        },
      ] satisfies AdaptorStringSelectComponent<unknown>["options"]);

      const component = result.current.Select();
      await interactionHelper.selectStringSelectComponent(component, [
        component.options.find((option) => option.label === "2-2")!.value,
      ]);

      await waitFor(() =>
        expect(result.current.result).toEqual(
          expect.arrayContaining([
            // prettier-ignore
            expect.objectContaining({ key: "0-0", selected: true }),
            expect.objectContaining({ key: "1-0", selected: false }),
            expect.objectContaining({ key: "1-1", selected: false }),
            expect.objectContaining({ key: "2-0", selected: false }),
            expect.objectContaining({ key: "2-1", selected: false }),
            expect.objectContaining({ key: "2-2", selected: true }),
          ])
        )
      );
    });

    test("オプションが選択されたとき選択数指定を満たしていればonSelectが呼ばれる", async () => {
      const onSelected = vi.fn();
      const options = createDummyOptions([1, 2, 3]);

      const { result, act, interactionHelper, waitFor } = renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
          onSelected: onSelected,
          minValues: 2,
          maxValues: 4,
        })
      );

      //page 0
      await interactionHelper.selectStringSelectComponent(
        result.current.Select(),
        result.current
          .Select()
          .options.filter((option) => option.label === "0-0")
          .map((option) => option.value)
      );

      //まだ選択数が足りないのでonSelectedは呼ばれない

      act(() => {
        result.current.setPage(1);
      });

      //page 1
      await interactionHelper.selectStringSelectComponent(
        result.current.Select(),
        result.current
          .Select()
          .options.filter((option) => option.label === "1-1")
          .map((option) => option.value)
      );

      await waitFor(() => expect(onSelected).toBeCalledTimes(1));
      expect(onSelected).toBeCalledWith(
        expect.arrayContaining([
          // prettier-ignore
          expect.objectContaining({ key: "0-0", selected: true }),
          expect.objectContaining({ key: "1-0", selected: false }),
          expect.objectContaining({ key: "1-1", selected: true }),
          expect.objectContaining({ key: "2-0", selected: false }),
          expect.objectContaining({ key: "2-1", selected: false }),
          expect.objectContaining({ key: "2-2", selected: false }),
        ])
      );

      onSelected.mockClear();

      act(() => {
        result.current.setPage(2);
      });

      //page 2
      await interactionHelper.selectStringSelectComponent(
        result.current.Select(),
        result.current
          .Select()
          .options.filter(
            (option) => option.label === "2-0" || option.label === "2-2"
          )
          .map((option) => option.value)
      );

      await waitFor(() => expect(onSelected).toBeCalledTimes(1));
      expect(onSelected).toBeCalledWith(
        expect.arrayContaining([
          // prettier-ignore
          expect.objectContaining({ key: "0-0", selected: true }),
          expect.objectContaining({ key: "1-0", selected: false }),
          expect.objectContaining({ key: "1-1", selected: true }),
          expect.objectContaining({ key: "2-0", selected: true }),
          expect.objectContaining({ key: "2-1", selected: false }),
          expect.objectContaining({ key: "2-2", selected: true }),
        ])
      );
    });

    test("showSelectedAlwaysがtrueの場合、選択されたオプションは常に表示される", async () => {
      const options = createDummyOptions([2, 2, 3]);

      const { result, act, interactionHelper, waitFor } = renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
          maxValues: 3,
          showSelectedAlways: true,
        })
      );

      //page 0
      await interactionHelper.selectStringSelectComponent(
        result.current.Select(),
        result.current
          .Select()
          .options.filter(
            (option) => option.label === "0-0" || option.label === "0-1"
          )
          .map((option) => option.value)
      );

      act(() => {
        result.current.setPage(1);
      });

      expect(result.current.Select().options).toEqual([
        expect.objectContaining({ value: "0-0", default: true }),
        expect.objectContaining({ value: "0-1", default: true }),
        expect.objectContaining({ value: "1-0", default: false }),
        expect.objectContaining({ value: "1-1", default: false }),
      ]);

      act(() => {
        result.current.setPage(2);
      });

      expect(result.current.Select().options).toEqual([
        expect.objectContaining({ value: "0-0", default: true }),
        expect.objectContaining({ value: "0-1", default: true }),
        expect.objectContaining({ value: "2-0", default: false }),
        expect.objectContaining({ value: "2-1", default: false }),
        expect.objectContaining({ value: "2-2", default: false }),
      ]);

      const values = result.current
        .Select()
        .options.filter(
          (option) => option.label === "0-1" || option.label === "2-0"
        )
        .map((option) => option.value);
      console.log("values", values);
      await interactionHelper.selectStringSelectComponent(
        result.current.Select(),
        values
      );

      setTimeout(() => {
        console.log(result.current.Select().options);
      }, 500);

      await waitFor(() =>
        expect(result.current.Select().options).toEqual([
          expect.objectContaining({ value: "0-1", default: true }),
          expect.objectContaining({ value: "2-0", default: true }),
          expect.objectContaining({ value: "2-1", default: false }),
          expect.objectContaining({ value: "2-2", default: false }),
        ])
      );

      act(() => {
        result.current.setPage(1);
      });

      expect(result.current.Select().options).toEqual([
        expect.objectContaining({ value: "0-1", default: true }),
        expect.objectContaining({ value: "2-0", default: true }),
        expect.objectContaining({ value: "1-0", default: false }),
        expect.objectContaining({ value: "1-1", default: false }),
      ]);
    });

    test("pageTorusがfalseの場合、最初のページと最後のページを超える値は閾値に揃えられる", () => {
      const options = createDummyOptions([1, 1, 1]);

      const { result, act } = renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
          pageTorus: false,
        })
      );

      act(() => {
        result.current.setPage(2);
      });

      expect(result.current.page).toBe(2);

      act(() => {
        result.current.setPage((prev) => prev + 1);
      });

      expect(result.current.page).toBe(2);

      act(() => {
        result.current.setPage((prev) => prev - 3);
      });

      expect(result.current.page).toBe(0);
    });

    test("pageTorusがtrueの場合、最初のページと最後のページが繋がる", () => {
      const options = createDummyOptions([1, 1, 1]);

      const { result, act } = renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
          pageTorus: true,
        })
      );

      act(() => {
        result.current.setPage(2);
      });

      expect(result.current.page).toBe(2);

      act(() => {
        result.current.setPage((prev) => prev + 1);
      });

      expect(result.current.page).toBe(0);

      act(() => {
        result.current.setPage((prev) => prev - 1);
      });

      expect(result.current.page).toBe(2);
    });
  });
});
