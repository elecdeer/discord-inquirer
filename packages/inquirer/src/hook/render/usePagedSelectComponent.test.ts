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

    test("引数で与えたオプションのdefaultフィールドによって初期状態が決まる", async () => {
      const options = createDummyOptions([1, 2, 3]);
      options[0][0].default = true;
      options[2][1].default = true;

      const { result } = await renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
        })
      );

      expect(result.current.result.length).toBe(6);
      expect(result.current.result).toEqual(
        expect.arrayContaining([
          // prettier-ignore
          expect.objectContaining({key: "0-0", selected: true}),
          expect.objectContaining({ key: "1-0", selected: false }),
          expect.objectContaining({ key: "1-1", selected: false }),
          expect.objectContaining({ key: "2-0", selected: false }),
          expect.objectContaining({ key: "2-1", selected: true }),
          expect.objectContaining({ key: "2-2", selected: false }),
        ])
      );
    });

    test("ページが切り替わるとコンポーネントが更新される", async () => {
      const options = createDummyOptions([1, 2, 3]);
      options[0][0].default = true;
      options[2][1].default = true;

      const { result, act } = await renderHook(() =>
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

      await act(() => {
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

      await act(() => {
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

      const { result, act, interactionHelper } = await renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
        })
      );
      await act(() => {
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
      );
    });

    test("オプションが選択されたとき選択数指定を満たしていればonSelectが呼ばれる", async () => {
      const onSelected = vi.fn();
      const options = createDummyOptions([1, 2, 3]);

      const { result, act, interactionHelper } = await renderHook(() =>
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

      await act(() => {
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

      expect(onSelected).toBeCalledTimes(1);
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

      await act(() => {
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

      expect(onSelected).toBeCalledTimes(1);
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

      const { result, act, interactionHelper } = await renderHook(() =>
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

      await act(() => {
        result.current.setPage(1);
      });

      expect(result.current.Select().options).toEqual([
        expect.objectContaining({ value: "0-0", default: true }),
        expect.objectContaining({ value: "0-1", default: true }),
        expect.objectContaining({ value: "1-0", default: false }),
        expect.objectContaining({ value: "1-1", default: false }),
      ]);

      await act(() => {
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
      await interactionHelper.selectStringSelectComponent(
        result.current.Select(),
        values
      );

      expect(result.current.Select().options).toEqual([
        expect.objectContaining({ value: "0-1", default: true }),
        expect.objectContaining({ value: "2-0", default: true }),
        expect.objectContaining({ value: "2-1", default: false }),
        expect.objectContaining({ value: "2-2", default: false }),
      ]);

      await act(() => {
        result.current.setPage(1);
      });

      expect(result.current.Select().options).toEqual([
        expect.objectContaining({ value: "0-1", default: true }),
        expect.objectContaining({ value: "2-0", default: true }),
        expect.objectContaining({ value: "1-0", default: false }),
        expect.objectContaining({ value: "1-1", default: false }),
      ]);
    });

    test("pageTorusがfalseの場合、最初のページと最後のページを超える値は閾値に揃えられる", async () => {
      const options = createDummyOptions([1, 1, 1]);

      const { result, act } = await renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
          pageTorus: false,
        })
      );

      await act(() => {
        result.current.setPage(2);
      });

      expect(result.current.page).toBe(2);

      await act(() => {
        result.current.setPage((prev) => prev + 1);
      });

      expect(result.current.page).toBe(2);

      await act(() => {
        result.current.setPage((prev) => prev - 3);
      });

      expect(result.current.page).toBe(0);
    });

    test("pageTorusがtrueの場合、最初のページと最後のページが繋がる", async () => {
      const options = createDummyOptions([1, 1, 1]);

      const { result, act } = await renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
          pageTorus: true,
        })
      );

      await act(() => {
        result.current.setPage(2);
      });

      expect(result.current.page).toBe(2);

      await act(() => {
        result.current.setPage((prev) => prev + 1);
      });

      expect(result.current.page).toBe(0);

      await act(() => {
        result.current.setPage((prev) => prev - 1);
      });

      expect(result.current.page).toBe(2);
    });

    test("filterでfalseを返したときはinteractionを無視する", async () => {
      const handleSelected = vi.fn();
      const options = createDummyOptions([1, 1, 1]);

      const { result, adaptorMock, interactionHelper } = await renderHook(() =>
        usePagedSelectComponent({
          optionsResolver: () => options,
          onSelected: handleSelected,
          filter: (interaction) => interaction.user.id === "foo",
        })
      );

      await interactionHelper.selectStringSelectComponent(
        result.current.Select(),
        [result.current.Select().options[0].value]
      );

      expect(handleSelected).not.toHaveBeenCalled();
      expect(adaptorMock.sendInteractionResponse).not.toHaveBeenCalled();

      await interactionHelper.selectStringSelectComponent(
        result.current.Select(),
        [result.current.Select().options[0].value],
        (base) => ({
          user: {
            ...base.user,
            id: "foo",
          },
        })
      );

      expect(handleSelected).toHaveBeenCalled();
      expect(adaptorMock.sendInteractionResponse).toHaveBeenCalled();
    });
  });
});
