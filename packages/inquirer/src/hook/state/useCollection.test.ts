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

      test("前回と異なる値をsetするとdispatchされる", () => {
        let renderNum = 0;
        const { act, result } = renderHook(() => {
          renderNum++;
          return useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
        });

        expect(renderNum).toBe(1);

        act(() => {
          result.current.set(3, { value: "3" });
        });

        expect(renderNum).toBe(2);
      });

      test("前回と同じ値をsetするとdispatchされない", () => {
        let renderNum = 0;
        const value2 = { value: "2" };
        const { act, result } = renderHook(() => {
          renderNum++;
          return useCollection([
            [1, { value: "1" }],
            [2, value2],
          ]);
        });

        expect(renderNum).toBe(1);

        act(() => {
          result.current.set(2, value2);
        });

        expect(renderNum).toBe(1);
      });
    });

    describe("setEach()", () => {
      test("保持している各エントリに対してsetできる", () => {
        let renderNum = 0;
        const { act, result } = renderHook(() => {
          renderNum++;
          return useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
        });

        expect(renderNum).toBe(1);

        act(() => {
          result.current.setEach((value) => ({ value: value.value + "!" }));
        });

        expect(result.current.get(1)).toEqual({ value: "1!" });
        expect(result.current.get(2)).toEqual({ value: "2!" });
        expect(renderNum).toBe(2);
      });

      test("全てのエントリに変化が無い場合はdispatchされない", () => {
        let renderNum = 0;
        const { act, result } = renderHook(() => {
          renderNum++;
          return useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
        });

        expect(renderNum).toBe(1);

        act(() => {
          result.current.setEach((prev) => prev);
        });

        expect(renderNum).toBe(1);
      });
    });

    describe("delete()", () => {
      test("値をdeleteできる", () => {
        let renderNum = 0;
        const { act, result } = renderHook(() => {
          renderNum++;
          return useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
        });

        expect(result.current.get(1)).toEqual({ value: "1" });

        expect(renderNum).toBe(1);

        act(() => {
          result.current.remove(1);
        });

        expect(renderNum).toBe(2);

        expect(result.current.get(1)).toBeUndefined();
      });
    });

    describe("reset()", () => {
      test("reset()を呼び出すとinitialStateの値にリセットされる", () => {
        let renderNum = 0;
        const { act, result } = renderHook(() => {
          renderNum++;
          return useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
        });

        act(() => {
          result.current.set(3, { value: "3" });
        });

        expect(result.current.get(3)).toEqual({ value: "3" });

        expect(renderNum).toBe(2);

        act(() => {
          result.current.reset();
        });

        expect(renderNum).toBe(3);

        expect(result.current.get(3)).toBeUndefined();
        expect(result.current.values()).toEqual(
          expect.arrayContaining([{ value: "1" }, { value: "2" }])
        );
      });
    });
  });
});
