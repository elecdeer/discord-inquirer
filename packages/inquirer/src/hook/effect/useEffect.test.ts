import { afterEach, describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";
import { useEffect } from "./useEffect";

describe("packages/inquirer/src/hook/useEffect", () => {
  describe("useEffect()", () => {
    let controller: ReturnType<typeof createHookContext> | undefined;

    afterEach(() => {
      try {
        controller?.endRender();
      } catch (e) {
        // skip
      }
    });

    test("mount時に正しくコールバックが呼ばれる", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      const callback = vi.fn();

      const render = () => {
        controller!.startRender();
        useEffect(callback);
        controller!.endRender();
      };

      render();
      controller.mount("dummyMessageId-0");
      expect(callback).toBeCalledTimes(1);

      controller.unmount();
      render();
      controller.mount("dummyMessageId-1");
      expect(callback).toBeCalledTimes(2);
    });

    test("unmount時に正しくクリーンナップが呼ばれる", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      const cleanup = vi.fn();

      controller.startRender();
      useEffect(() => cleanup);
      controller.endRender();

      controller.mount("dummyMessageId-0");
      expect(cleanup).not.toHaveBeenCalled();
      controller.unmount();
      expect(cleanup).toBeCalledTimes(1);
    });

    test("マウントが行われない場合はコールバックは呼ばれない", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      const callback = vi.fn();

      controller.startRender();
      useEffect(callback);
      controller.endRender();

      expect(callback).not.toHaveBeenCalled();
    });

    test("depsを指定しない場合は毎回呼ばれる", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      const callback = vi.fn();

      const renderWithMount = () => {
        callback.mockClear();

        controller!.unmount();
        controller!.startRender();
        useEffect(callback);
        controller!.endRender();
        controller!.mount("dummyMessageId-0");
      };

      renderWithMount();
      expect(callback).toHaveBeenCalledOnce();

      renderWithMount();
      expect(callback).toHaveBeenCalledOnce();

      renderWithMount();
      expect(callback).toHaveBeenCalledOnce();
    });

    test("depsが空配列の場合は初回のみ呼ばれる", () => {
      const controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      const callback = vi.fn();

      const renderWithMount = () => {
        callback.mockClear();

        controller.unmount();
        controller.startRender();
        useEffect(callback, []);
        controller.endRender();
        controller.mount("dummyMessageId-0");
      };

      renderWithMount();
      expect(callback).toHaveBeenCalledOnce();

      renderWithMount();
      expect(callback).not.toHaveBeenCalled();
    });

    test("depsが指定されている場合はdepsが変わるまで呼ばれない", () => {
      const controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      const callback = vi.fn();

      const renderWithMount = (depsValue: unknown[]) => {
        callback.mockClear();

        controller.unmount();
        controller.startRender();
        useEffect(callback, depsValue);
        controller.endRender();
        controller.mount("dummyMessageId-0");
      };

      renderWithMount([0]);
      expect(callback).toHaveBeenCalledOnce();

      renderWithMount([0]);
      expect(callback).not.toHaveBeenCalled();

      const value = {
        count: 0,
      };
      renderWithMount([value]);
      expect(callback).toHaveBeenCalledOnce();

      value.count = value.count + 1;
      renderWithMount([value]);
      // depsの参照が変わっていないので呼ばれない
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
