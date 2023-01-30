import { useEffect } from "./useEffect";
import {
  isAdaptorChannelSelectInteraction,
  messageFacade,
} from "../../adaptor";
import { batchDispatchAsync, getHookContext } from "../../core/hookContext";

import type {
  AdaptorChannelSelectInteraction,
  AdaptorPartialChannel,
} from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useChannelSelectEvent = (
  customId: string,
  handle: (
    interaction: Readonly<AdaptorChannelSelectInteraction>,
    channels: readonly AdaptorPartialChannel[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const ctx = getHookContext();
  const adapter = ctx.adaptor;

  useEffect(() => {
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
      if (!isAdaptorChannelSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      const channels = interaction.data.values.map(
        (id) => interaction.data.resolved.channels[id]
      );

      void batchDispatchAsync(ctx, async () => {
        await handle(interaction, channels, deferUpdate);
      });
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
