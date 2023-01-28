import { describe, expect, test } from "vitest";

import { useCustomId } from "./useCustomId";
import { renderHook } from "../../testing";

describe("packages/inquirer/src/hook/useCustomId", () => {
  describe("useCustomId()", () => {
    test("ユニークなIdを生成し保持する", () => {
      const { result } = renderHook(() => useCustomId("this-is-prefix"));
      const customId = result.current;
      expect(result.current.length).toBeLessThan(100);

      expect(result.current).toBe(customId);
    });
  });
});
