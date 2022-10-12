import { getHookContext } from "../core/hookContext";
import { useEffect } from "./useEffect";

import type { Snowflake } from "../adaptor";
import type { Awaitable } from "vitest";

export const useButtonEvent = (
  customId: string,
  handle: (interactionId: Snowflake) => Awaitable<void>
) => {
  useEffect(() => {
    const adapter = getHookContext().adaptor;

    const clear = adapter.subscribeInteraction((interaction) => {
      if (interaction.type !== "messageComponent") return;
      if (interaction.data.componentType !== "button") return;
      if (interaction.data.customId !== customId) return;
      handle(interaction.id);
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
