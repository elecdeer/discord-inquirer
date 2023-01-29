import { describe, expect, test } from "vitest";

import { useState } from "./useState";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useState", () => {
  describe("useState()", () => {
    test("初期値が保持される", () => {
      const { result, rerender } = renderHook(
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

      rerender();

      expect(result.current.value).toBe(3);

      rerender({
        newArgs: 10,
      });

      expect(result.current.value).toBe(3);
    });

    test("setStateで正しく状態が保存される", () => {
      const { result, act } = renderHook(() => {
        const [value, setState] = useState(2);
        return {
          value,
          setState,
        };
      });
      expect(result.current.value).toBe(2);

      act(() => {
        result.current.setState(10);
      });
      expect(result.current.value).toBe(10);

      act(() => {
        result.current.setState((prev) => prev + 2);
        result.current.setState((prev) => prev + 3);
      });

      expect(result.current.value).toBe(15);
    });

    test("setStateの呼び出しでdispatchが呼ばれる", () => {
      let renderNum = 0;

      const { result, act } = renderHook(() => {
        renderNum++;

        const [value, setState] = useState(2);
        return {
          value,
          setState,
        };
      });

      expect(renderNum).toBe(1);

      act(() => {
        result.current.setState(3);
      });

      expect(renderNum).toBe(2);

      act(() => {
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
