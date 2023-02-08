import { describe, expect, test, vi } from "vitest";

import { useMultiPagePrompt } from "./useMultiPagePrompt";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/render/useMultiPagePrompt", () => {
  describe("useMultiPagePrompt()", () => {
    test("defaultPageで指定したページが初期状態になる", () => {
      const { result } = renderHook(() =>
        useMultiPagePrompt(
          [
            ["foo", () => ({ content: "foo" })],
            ["bar", () => ({ content: "bar" })],
          ],
          "foo"
        )
      );

      expect(result.current.result).toEqual({
        content: "foo",
      });
    });

    test("ページを切り替えるとresultが更新される", async () => {
      const { result, act } = renderHook(() =>
        useMultiPagePrompt(
          [
            ["foo", () => ({ content: "foo" })],
            ["bar", () => ({ content: "bar" })],
          ],
          "foo"
        )
      );

      act(() => {
        result.current.setPage("bar");
      });

      expect(result.current.result).toEqual({ content: "bar" });
    });

    test("表示されるかどうかに関わらず全てのページがRenderされる", () => {
      const renderFoo = vi.fn(() => ({ content: "foo" }));
      const renderBar = vi.fn(() => ({ content: "bar" }));

      renderHook(() =>
        useMultiPagePrompt(
          [
            ["foo", renderFoo],
            ["bar", renderBar],
          ],
          "foo"
        )
      );

      expect(renderFoo).toHaveBeenCalledOnce();
      expect(renderBar).toHaveBeenCalledOnce();
    });
  });
});
