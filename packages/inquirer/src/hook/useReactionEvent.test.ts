import { describe, expect, test, vi } from "vitest";

import { createDiscordAdaptorMock } from "../adaptor";
import { createHookContext } from "../core/hookContext";
import { useReactionEvent } from "./useReactionEvent";

describe("packages/inquirer/src/hook/useReactionEvent", () => {
  describe("useReactionEvent()", () => {
    test("messageIdが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useReactionEvent(handle);

      controller.afterMount("messageId");
      controller.endRender();

      adaptorMock.emitMessageReaction!({
        action: "add",
        messageId: "messageId",
        userId: "userId",
        channelId: "channelId",
        emoji: {
          id: "emojiId",
          name: "emojiName",
          animated: false,
        },
      });

      expect(handle).toBeCalledWith({
        action: "add",
        messageId: "messageId",
        userId: "userId",
        channelId: "channelId",
        emoji: {
          id: "emojiId",
          name: "emojiName",
          animated: false,
        },
      });
      expect(handle).toBeCalledTimes(1);

      controller.close();
    });

    test("messageIdが一致していない際はhandlerが呼ばれない", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useReactionEvent(handle);

      controller.afterMount("messageId");
      controller.endRender();

      adaptorMock.emitMessageReaction!({
        action: "add",
        messageId: "messageIdUnMatch",
        userId: "userId",
        channelId: "channelId",
        emoji: {
          id: "emojiId",
          name: "emojiName",
          animated: false,
        },
      });

      expect(handle).not.toHaveBeenCalled();

      controller.close();
    });
  });
});
