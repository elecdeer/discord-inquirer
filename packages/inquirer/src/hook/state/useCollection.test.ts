import { afterEach, describe, expect, test } from "vitest";

import { useCollection } from "./useCollection";
import { renderHook } from "../../testing";

import type { createHookCycle } from "../../core/hookContext";

describe("packages/inquirer/src/hook/useCollection", () => {
  describe("useCollection()", () => {
    let controller: ReturnType<typeof createHookCycle> | undefined;

    afterEach(() => {
      try {
        controller?.endRender();
      } catch (e) {
        // skip
      }
    });

    describe("set()", () => {
      test("setした値が保持される", () => {
        const { act, result } = renderHook(() =>
          useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ])
        );

        act(() => {
          result.current.set(3, { value: "3" });
        });

        expect(result.current.get(3)).toEqual({ value: "3" });
      });

      test.todo("前回と異なる値をsetするとdispatchされる", () => {
        const { act, result } = renderHook(() =>
          useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ])
        );

        act(() => {
          result.current.set(3, { value: "3" });
        });

        //TODO dispatchが呼ばれることのテスト
      });

      test.todo("前回と同じ値をsetするとdispatchされない", () => {
        const value2 = { value: "2" };
        const { act, result } = renderHook(() =>
          useCollection([
            [1, { value: "1" }],
            [2, value2],
          ])
        );

        act(() => {
          result.current.set(2, value2);
        });

        //TODO dispatchが呼ばれないことのテスト
      });
    });

    describe("setEach()", () => {
      test("保持している各エントリに対してsetできる", () => {
        const { act, result } = renderHook(() =>
          useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ])
        );

        act(() => {
          result.current.setEach((value) => ({ value: value.value + "!" }));
        });

        expect(result.current.get(1)).toEqual({ value: "1!" });
        expect(result.current.get(2)).toEqual({ value: "2!" });

        //TODO dispatchが呼ばれることのテスト
      });

      test.todo("全てのエントリに変化が無い場合はdispatchされない", () => {
        const { act, result } = renderHook(() =>
          useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ])
        );

        act(() => {
          result.current.setEach((prev) => prev);
        });

        //TODO dispatchが呼ばれないことのテスト
      });
    });

    describe("delete()", () => {
      test("値をdeleteできる", () => {
        const { act, result } = renderHook(() =>
          useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ])
        );

        expect(result.current.get(1)).toEqual({ value: "1" });

        act(() => {
          result.current.remove(1);
        });

        expect(result.current.get(1)).toBeUndefined();
        //TODO dispatchが呼ばれることのテスト
      });
    });

    describe("reset()", () => {
      test("reset()を呼び出すとinitialStateの値にリセットされる", () => {
        const { act, result } = renderHook(() =>
          useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ])
        );

        act(() => {
          result.current.set(3, { value: "3" });
        });

        expect(result.current.get(3)).toEqual({ value: "3" });

        act(() => {
          result.current.reset();
        });

        expect(result.current.get(3)).toBeUndefined();
        expect(result.current.values()).toEqual(
          expect.arrayContaining([{ value: "1" }, { value: "2" }])
        );

        //TODO dispatchが呼ばれることのテスト
      });
    });
  });
});
