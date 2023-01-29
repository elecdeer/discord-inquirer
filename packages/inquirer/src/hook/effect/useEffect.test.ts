import { describe, expect, test, vi } from "vitest";

import { useEffect } from "./useEffect";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useEffect", () => {
  describe("useEffect()", () => {
    test("mount時に正しくコールバックが呼ばれる", () => {
      const callback = vi.fn();
      const { rerender } = renderHook(() => useEffect(callback));

      expect(callback).toBeCalledTimes(1);

      rerender();

      expect(callback).toBeCalledTimes(2);
    });

    test("unmount時に正しくクリーンナップが呼ばれる", () => {
      const cleanup = vi.fn();

      const { unmount } = renderHook(() => useEffect(() => cleanup));

      expect(cleanup).not.toHaveBeenCalled();
      unmount();
      expect(cleanup).toBeCalledTimes(1);
    });

    test("depsを指定しない場合は毎回呼ばれる", () => {
      const callback = vi.fn();
      const { rerender } = renderHook(() => useEffect(callback));

      expect(callback).toBeCalledTimes(1);
      for (let i = 0; i < 10; i++) {
        callback.mockClear();
        rerender();
        expect(callback).toBeCalledTimes(1);
      }
    });

    test("depsが空配列の場合は初回のみ呼ばれる", () => {
      const callback = vi.fn();
      const { rerender } = renderHook(() => useEffect(callback, []));

      expect(callback).toHaveBeenCalledOnce();

      callback.mockClear();
      rerender();
      expect(callback).not.toHaveBeenCalled();
    });

    test("depsが指定されている場合はdepsが変わるまで呼ばれない", () => {
      const callback = vi.fn();

      const objectValue = {
        count: 0,
      };
      const { rerender } = renderHook(
        ([value, objValue]) => useEffect(callback, [value, objValue]),
        {
          initialArgs: [0, objectValue],
        }
      );

      expect(callback).toHaveBeenCalledOnce();
      callback.mockClear();

      rerender();
      expect(callback).not.toHaveBeenCalled();

      rerender({
        newArgs: [1, objectValue],
      });
      expect(callback).toHaveBeenCalledOnce();
      callback.mockClear();

      // depsの参照が変わっていないので呼ばれない
      objectValue.count = objectValue.count + 1;
      rerender({
        newArgs: [1, objectValue],
      });
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
