import { afterEach, describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";
import { useMemo } from "./useMemo";

describe("packages/inquirer/src/hook/useMemo", () => {
  describe("useMemo()", () => {
    let controller: ReturnType<typeof createHookContext> | undefined;

    afterEach(() => {
      try {
        controller?.endRender();
      } catch (e) {
        // skip
      }
    });

    test("値が保持される", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      {
        controller.startRender();
        const memo = useMemo(() => 3, []);
        expect(memo).toBe(3);
        controller.endRender();
      }

      {
        controller.startRender();
        const memo = useMemo(() => 10, []);
        expect(memo).toBe(3);
        controller.endRender();
      }
    });

    test("depsが変更されなかった場合はfactory()が呼ばれない", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      const deps = [1, "bar"];

      {
        controller.startRender();
        const factory = vi.fn(() => 3);
        useMemo(factory, deps);
        expect(factory).toHaveBeenCalled();
        controller.endRender();
      }

      {
        controller.startRender();
        const factory = vi.fn(() => 10);
        useMemo(factory, deps);
        expect(factory).not.toHaveBeenCalled();
        controller.endRender();
      }
    });

    test("depsが変化した際にfactory()が呼ばれ新しい値が保持される", () => {
      controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

      {
        controller.startRender();
        const memo = useMemo(() => 3, [1, "bar"]);
        expect(memo).toBe(3);
        controller.endRender();
      }

      {
        controller.startRender();
        const factory = vi.fn(() => 10);
        const memo = useMemo(factory, [1, "changed"]);
        expect(memo).toBe(10);
        expect(factory).toHaveBeenCalled();
        controller.endRender();
      }
    });
  });
});
