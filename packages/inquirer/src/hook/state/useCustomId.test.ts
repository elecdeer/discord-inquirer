import { describe, expect, test, vi } from "vitest";

import { useCustomId } from "./useCustomId";
import { createHookCycle } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";

describe("packages/inquirer/src/hook/useCustomId", () => {
  describe("useCustomId()", () => {
    test("ユニークなIdを生成し保持する", () => {
      const controller = createHookCycle(createDiscordAdaptorMock(), vi.fn());

      controller.startRender();
      const customId = useCustomId("this-is-prefix");
      expect(customId.length).toBeLessThanOrEqual(100);
      controller.endRender();

      controller.startRender();
      const customId2 = useCustomId("this-is-prefix");
      expect(customId2).toBe(customId);
      controller.endRender();
    });
  });
});
