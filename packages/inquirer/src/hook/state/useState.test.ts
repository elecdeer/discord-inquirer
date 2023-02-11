import { describe, expect, test } from "vitest";

import { useState } from "./useState";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useState", () => {
  describe("useState()", () => {
    test("初期値が保持される", async () => {
      const { result, rerender } = await renderHook(
        (args) => {
          const [value, setState] = useState(args);
          return {
            value,
            setState,
          };
        },
        {
          initialArgs: 3,
        }
      );

      expect(result.current.value).toBe(3);

      await rerender();

      expect(result.current.value).toBe(3);

      await rerender({
        newArgs: 10,
      });

      expect(result.current.value).toBe(3);
    });

    test("setStateで正しく状態が保存される", async () => {
      const { result, act } = await renderHook(() => {
        const [value, setState] = useState(2);
        return {
          value,
          setState,
        };
      });
      expect(result.current.value).toBe(2);

      await act(() => {
        result.current.setState(10);
      });
      expect(result.current.value).toBe(10);

      await act(() => {
        result.current.setState((prev) => prev + 2);
        result.current.setState((prev) => prev + 3);
      });

      expect(result.current.value).toBe(15);
    });

    test("setStateの呼び出しでdispatchが呼ばれる", async () => {
      let renderNum = 0;

      const { result, act } = await renderHook(() => {
        renderNum++;

        const [value, setState] = useState(2);
        return {
          value,
          setState,
        };
      });

      expect(renderNum).toBe(1);

      await act(() => {
        result.current.setState(3);
      });

      expect(renderNum).toBe(2);

      await act(() => {
        result.current.setState((prev) => prev + 2);
      });

      expect(renderNum).toBe(3);
    });

    test("context外で呼び出すとエラーになる", () => {
      expect(() => {
        useState(0);
      }).toThrowError();
    });
  });
});
