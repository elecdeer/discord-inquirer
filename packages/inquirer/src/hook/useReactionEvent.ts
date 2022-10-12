import { getHookContext } from "../core/hookContext";
import { useEffect } from "./useEffect";

import type { MessageReaction } from "../adaptor";
import type { Awaitable } from "vitest";

export const useReactionEvent = (
  handle: (reaction: MessageReaction) => Awaitable<void>
) => {
  useEffect(
    (messageId) => {
      const adapter = getHookContext().adaptor;

      const clear = adapter.subscribeMessageReaction((reaction) => {
        if (messageId !== reaction.messageId) return;
        handle(reaction);
      });

      return () => {
        clear();
      };
    },
    [handle]
  );
};

//TODO MessageをfetchしてReaction全体を取得できるようにしてもいいかも
