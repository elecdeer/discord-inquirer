import { messageFacade } from "../adaptor/messageFacade";
import { getHookContext } from "../core/hookContext";
import { useEffect } from "./useEffect";

import type { InteractionBase } from "../adaptor";
import type { Awaitable } from "../util/types";

export const useButtonEvent = (
  customId: string,
  handle: (
    interaction: InteractionBase,
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  useEffect(() => {
    const adapter = getHookContext().adaptor;
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
      if (interaction.type !== "messageComponent") return;
      if (interaction.data.componentType !== "button") return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      handle(
        {
          id: interaction.id,
          token: interaction.token,
          userId: interaction.userId,
          guildId: interaction.guildId,
          channelId: interaction.channelId,
        },
        deferUpdate
      );
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
