import { describe, expect, test, vi } from "vitest";

import { useObserveValue } from "./useObserveValue";
import { renderHook } from "../../testing";
import { useState } from "../state/useState";

describe("packages/inquirer/src/hook/effect/useObserveValue", () => {
  describe("useObserveValue()", () => {
    test("返り値の関数で変更がマークされたとき、mount後にhandlerが呼ばれる", () => {
      const handler = vi.fn();
      const { result, act } = renderHook(() => {
        const [state, setState] = useState(3);
        const markUpdate = useObserveValue(state, handler);
        return {
          setState,
          markUpdate,
        };
      });

      expect(handler).not.toBeCalled();

      //something event...
      act(() => {
        result.current.setState(10);
        result.current.markUpdate();
      });

      expect(handler).toHaveBeenCalledWith(10);
    });

    test("変更がマークされなかった時はhandlerが呼ばれない", () => {
      const handler = vi.fn();
      const { result, act } = renderHook(() => {
        const [state, setState] = useState(3);
        useObserveValue(state, handler);
        return {
          setState,
        };
      });

      result.current.setState(10);

      expect(handler).not.toBeCalled();
    });
  });
});
