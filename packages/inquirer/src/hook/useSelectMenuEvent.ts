import { getHookContext } from "../core/hookContext";
import { useEffect } from "./useEffect";

import type { Snowflake } from "../adaptor";
import type { Awaitable } from "vitest";

export const useSelectMenuEvent = (
  customId: string,
  handle: (interactionId: Snowflake, values: string[]) => Awaitable<void>
) => {
  useEffect(() => {
    const adapter = getHookContext().adaptor;

    const clear = adapter.subscribeInteraction((interaction) => {
      if (interaction.type !== "messageComponent") return;
      if (interaction.data.componentType !== "selectMenu") return;
      if (interaction.data.customId !== customId) return;
      handle(interaction.id, interaction.data.values);
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
