import { describe, expect, test } from "vitest";

import { useState } from "./useState";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useState", () => {
  describe("useState()", () => {
    test("初期値が保持される", () => {
      const { result, rerender, act } = renderHook(
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

    test.todo("setStateの呼び出しでdispatchが呼ばれる", () => {
      const { result, act } = renderHook(() => {
        const [value, setState] = useState(2);
        return {
          value,
          setState,
        };
      });

      act(() => {
        result.current.setState(3);
      });

      //TODO dispatchが呼ばれていることを確認する

      act(() => {
        result.current.setState((prev) => prev + 2);
      });

      //TODO dispatchが呼ばれていることを確認する
    });

    test("context外で呼び出すとエラーになる", () => {
      expect(() => {
        useState(0);
      }).toThrowError();
    });
  });
});
