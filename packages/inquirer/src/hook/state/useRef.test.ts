import { describe, expect, test } from "vitest";

import { useRef } from "./useRef";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useRef", () => {
  describe("useRef()", () => {
    test("値を保持する", () => {
      const { rerender, result } = renderHook((args) => useRef(args), {
        initialArgs: 3,
      });

      expect(result.current.current).toBe(3);

      rerender();

      expect(result.current.current).toBe(3);
      result.current.current = 20;

      rerender();

      expect(result.current.current).toBe(20);
    });

    test.todo("値を変更してもdispatchは呼ばれない", () => {
      const { result, act } = renderHook(() => useRef(3));

      act(() => {
        result.current.current = 10;
      });

      //TODO dispatchが呼ばれていないことを確認する
    });
  });
});
