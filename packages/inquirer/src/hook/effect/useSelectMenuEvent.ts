import { messageFacade } from "../../adaptor";
import { getHookContext } from "../../core/hookContext";
import { useEffect } from "./useEffect";

import type { InteractionBase } from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useSelectMenuEvent = (
  customId: string,
  handle: (
    interaction: InteractionBase,
    values: string[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adapter = getHookContext().adaptor;
  useEffect(() => {
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
      if (interaction.type !== "messageComponent") return;
      if (interaction.data.componentType !== "selectMenu") return;
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
        interaction.data.values,
        deferUpdate
      );
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
