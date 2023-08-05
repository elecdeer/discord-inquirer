import { describe, expect, test, vi } from "vitest";

import { useChannelSelectComponent } from "./useChannelSelectComponent";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useChannelSelectComponent", () => {
  describe("useChannelSelectComponent()", () => {
    test("初期状態ではどのチャンネルも選択されていない", async () => {
      const { result } = await renderHook(() => useChannelSelectComponent());

      expect(result.current[0]).toEqual([]);
    });

    test("チャンネルが選択されるとonSelectが呼ばれる", async () => {
      const handle = vi.fn();
      const { result, interactionHelper } = await renderHook(() =>
        useChannelSelectComponent({
          onSelected: handle,
        }),
      );

      const component = result.current[1]();
      await interactionHelper.selectChannelSelectComponent(component, [
        {
          type: "guildText",
          name: "foo",
        },
        {
          type: "guildText",
          name: "bar",
        },
      ]);

      expect(handle).toBeCalledTimes(1);

      expect(handle).toBeCalledWith([
        expect.objectContaining({
          type: "guildText",
          name: "foo",
        }),
        expect.objectContaining({
          type: "guildText",
          name: "bar",
        }),
      ]);
    });

    test("チャンネルが選択されると選択状態が更新される", async () => {
      const { result, interactionHelper } = await renderHook(() =>
        useChannelSelectComponent(),
      );

      const component = result.current[1]();
      await interactionHelper.selectChannelSelectComponent(component, [
        {
          type: "guildText",
          name: "foo",
        },
        {
          type: "guildText",
          name: "bar",
        },
      ]);

      expect(result.current[0]).toEqual([
        expect.objectContaining({
          type: "guildText",
          name: "foo",
        }),
        expect.objectContaining({
          type: "guildText",
          name: "bar",
        }),
      ]);
    });

    test("最小選択数と最大選択数の指定がコンポーネントデータに含まれる", async () => {
      const { result } = await renderHook(() =>
        useChannelSelectComponent({
          minValues: 1,
          maxValues: 2,
        }),
      );

      const component = result.current[1]();
      expect(component).toEqual(
        expect.objectContaining({
          minValues: 1,
          maxValues: 2,
        }),
      );
    });

    test("filterでfalseを返したときはinteractionを無視する", async () => {
      const handle = vi.fn();
      const { result, adaptorMock, interactionHelper } = await renderHook(() =>
        useChannelSelectComponent({
          onSelected: handle,
          filter: (interaction) => interaction.user.id === "foo",
        }),
      );

      const component = result.current[1]();
      const dummyChannels = [
        {
          type: "guildText",
          name: "foo",
        },
        {
          type: "guildText",
          name: "bar",
        },
      ] as const;
      await interactionHelper.selectChannelSelectComponent(
        component,
        dummyChannels,
      );

      expect(adaptorMock.sendInteractionResponse).not.toHaveBeenCalled();
      expect(handle).not.toHaveBeenCalled();

      await interactionHelper.selectChannelSelectComponent(
        component,
        dummyChannels,
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
});
