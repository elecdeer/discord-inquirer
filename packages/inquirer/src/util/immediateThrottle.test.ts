import { describe, expect, test, vi } from "vitest";

import { immediateThrottle } from "./immediateThrottle";

describe("packages/inquirer/src/util/immediateThrottle", () => {
  describe("immediateThrottle()", () => {
    test("同期的に複数回呼んでも一回だけ実行される", () => {
      const fn = vi.fn();

      const throttle = immediateThrottle(fn);

      throttle();
      throttle();
      throttle();

      setImmediate(() => {
        expect(fn).toHaveBeenCalledTimes(1);
      });
    });

    test("間隔を空けて複数回呼べばその回数呼ばれる", () => {
      const fn = vi.fn();

      const throttle = immediateThrottle(fn);

      throttle();
      throttle();

      setImmediate(() => {
        throttle();
        throttle();

        setImmediate(() => {
          expect(fn).toHaveBeenCalledTimes(2);
        });
      });
    });
  });
});
