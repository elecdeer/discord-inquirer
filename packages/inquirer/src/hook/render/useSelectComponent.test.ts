import { describe, expect, test, vi } from "vitest";

import {
  useSelectComponent,
  useSingleSelectComponent,
} from "./useSelectComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useSelectComponent", () => {
  describe("useSelectComponent()", () => {
    test("引数で与えたオプションのdefaultフィールドによって初期状態が決まる", async () => {
      const { result } = await renderHook(() =>
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
        }),
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
      const { result, interactionHelper } = await renderHook(() =>
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
        }),
      );

      await interactionHelper.selectStringSelectComponent(
        result.current[1](),
        result.current[1]()
          .options.filter((option) => option.label === "bar")
          .map((option) => option.value),
      );

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
      const { result, interactionHelper } = await renderHook(() =>
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
        }),
      );

      await interactionHelper.selectStringSelectComponent(
        result.current[1](),
        result.current[1]()
          .options.filter((option) => option.label === "bar")
          .map((option) => option.value),
      );

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
      ]);
    });

    test("inactiveなオプションはコンポーネントに含まれない", async () => {
      const { result } = await renderHook(() =>
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
        }),
      );

      expect(result.current[1]().options).toEqual([
        expect.not.objectContaining({
          label: "foo",
        }),
      ]);
    });

    test("filterでfalseを返したときはinteractionを無視する", async () => {
      const handle = vi.fn();
      const { result, adaptorMock, interactionHelper } = await renderHook(() =>
        useSelectComponent({
          onSelected: handle,
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
          filter: (interaction) => interaction.user.id === "foo",
        }),
      );

      const component = result.current[1]();

      await interactionHelper.selectStringSelectComponent(component, [
        component.options[0].value,
      ]);
      expect(adaptorMock.sendInteractionResponse).not.toHaveBeenCalled();
      expect(handle).not.toHaveBeenCalled();

      await interactionHelper.selectStringSelectComponent(
        component,
        [component.options[0].value],
        (base) => ({
          user: {
            ...base.user,
            id: "foo",
          },
        }),
      );
      expect(adaptorMock.sendInteractionResponse).toHaveBeenCalled();
      expect(handle).toHaveBeenCalled();
    });
  });

  describe("useSingleSelectComponent()", () => {
    test("最大選択数が1のコンポーネントが生成される", async () => {
      const { result } = await renderHook(() =>
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
        }),
      );

      const component = result.current[1]();
      expect(component).toEqual(
        expect.objectContaining({
          maxValues: 1,
        }),
      );
    });
  });
});
