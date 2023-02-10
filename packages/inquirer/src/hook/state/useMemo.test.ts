import { describe, expect, test, vi } from "vitest";

import { useMemo } from "./useMemo";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useMemo", () => {
  describe("useMemo()", () => {
    test("値が保持される", async () => {
      const { rerender, result } = await renderHook(
        (args) => useMemo(() => args, []),
        {
          initialArgs: 3,
        }
      );

      expect(result.current).toBe(3);

      await rerender({
        newArgs: 10,
      });

      expect(result.current).toBe(3);
    });

    test("depsが変更されなかった場合はfactory()が呼ばれない", async () => {
      const deps = [1, "bar"];

      const { rerender, result } = await renderHook(
        (args) => useMemo(() => args, deps),
        {
          initialArgs: 3,
        }
      );

      expect(result.current).toBe(3);

      await rerender({
        newArgs: 10,
      });

      expect(result.current).toBe(3);
    });

    test("depsが変化した際にfactory()が呼ばれ新しい値が保持される", async () => {
      const factory = vi.fn(() => 10);
      const { rerender, result } = await renderHook(
        (deps) => useMemo(factory, deps),
        {
          initialArgs: [1, "bar"],
        }
      );
      expect(factory).toHaveBeenCalledOnce();
      factory.mockClear();

      expect(result.current).toBe(10);

      await rerender({
        newArgs: [1, "changed"],
      });

      expect(factory).toHaveBeenCalledOnce();
    });
  });
});
