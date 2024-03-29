import { describe, expect, test } from "vitest";

import { useRef } from "./useRef";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useRef", () => {
  describe("useRef()", () => {
    test("値を保持する", async () => {
      const { rerender, result } = await renderHook((args) => useRef(args), {
        initialArgs: 3,
      });

      expect(result.current.current).toBe(3);

      await rerender();

      expect(result.current.current).toBe(3);
      result.current.current = 20;

      await rerender();

      expect(result.current.current).toBe(20);
    });

    test("値を変更してもdispatchは呼ばれない", async () => {
      let renderNum = 0;
      const { result, act } = await renderHook(() => {
        renderNum++;
        return useRef(3);
      });

      await act(() => {
        result.current.current = 10;
      });

      expect(renderNum).toBe(1);
    });
  });
});
