import { afterEach, describe, expect, test, vi } from "vitest";

import { useCollection } from "./useCollection";
import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";

describe("packages/inquirer/src/hook/useCollection", () => {
  describe("useCollection()", () => {
    let controller: ReturnType<typeof createHookContext> | undefined;

    afterEach(() => {
      try {
        controller?.endRender();
      } catch (e) {
        // skip
      }
    });

    describe("set()", () => {
      test("setした値が保持される", () => {
        controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

        {
          controller.startRender();
          const { set } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          set(3, { value: "3" });
          controller.endRender();
        }

        {
          controller.startRender();
          const { get } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          expect(get(3)).toEqual({ value: "3" });
          controller.endRender();
        }
      });

      test("前回と異なる値をsetするとdispatchされる", () => {
        const dispatch = vi.fn();
        controller = createHookContext(createDiscordAdaptorMock(), dispatch);

        {
          controller.startRender();
          const { set } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          set(3, { value: "3" });
          controller.endRender();

          expect(dispatch).toHaveBeenCalled();
        }
      });

      test("前回と同じ値をsetするとdispatchされない", () => {
        const dispatch = vi.fn();
        controller = createHookContext(createDiscordAdaptorMock(), dispatch);

        const value2 = { value: "2" };

        {
          controller.startRender();
          const { set } = useCollection([
            [1, { value: "1" }],
            [2, value2],
          ]);
          set(2, value2);
          controller.endRender();

          expect(dispatch).not.toHaveBeenCalled();
        }
      });
    });

    describe("setEach()", () => {
      test("保持している各エントリに対してsetできる", () => {
        const dispatch = vi.fn();
        controller = createHookContext(createDiscordAdaptorMock(), dispatch);

        {
          controller.startRender();
          const { setEach } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          setEach((value) => ({ value: value.value + "!" }));
          controller.endRender();

          expect(dispatch).toHaveBeenCalled();
        }

        {
          controller.startRender();
          const { get } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          expect(get(1)).toEqual({ value: "1!" });
          expect(get(2)).toEqual({ value: "2!" });
          controller.endRender();
        }

        controller.unmount();
      });

      test("全てのエントリに変化が無い場合はdispatchされない", () => {
        const dispatch = vi.fn();
        controller = createHookContext(createDiscordAdaptorMock(), dispatch);

        {
          controller.startRender();
          const { setEach } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          setEach((prev) => prev);

          expect(dispatch).not.toHaveBeenCalled();
          controller.endRender();
        }

        controller.unmount();
      });
    });

    describe("delete()", () => {
      test("値をdeleteできる", () => {
        controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

        {
          controller.startRender();
          const { remove, get } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          expect(get(1)).toEqual({ value: "1" });
          remove(1);

          controller.endRender();
        }

        {
          controller.startRender();
          const { get } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          expect(get(1)).toBeUndefined();

          controller.endRender();
        }
      });
    });

    describe("reset()", () => {
      test("reset()を呼び出すとinitialStateの値にリセットされる", () => {
        controller = createHookContext(createDiscordAdaptorMock(), vi.fn());

        {
          controller.startRender();
          const { set } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          set(3, { value: "3" });

          controller.endRender();
        }

        {
          controller.startRender();
          const { get, reset } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          expect(get(3)).toEqual({ value: "3" });
          reset();

          controller.endRender();
        }

        {
          controller.startRender();
          const { get } = useCollection([
            [1, { value: "1" }],
            [2, { value: "2" }],
          ]);
          expect(get(3)).toBeUndefined();
        }
      });
    });
  });
});
