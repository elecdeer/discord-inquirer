import {
  isAdaptorChannelSelectInteraction,
  messageFacade,
} from "../../adaptor";
import { getHookContext } from "../../core/hookContext";
import { useEffect } from "./useEffect";

import type {
  AdaptorChannelSelectInteraction,
  AdaptorPartialChannel,
} from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useChannelSelectEvent = (
  customId: string,
  handle: (
    interaction: AdaptorChannelSelectInteraction,
    channels: AdaptorPartialChannel[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adapter = getHookContext().adaptor;
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
      handle(
        {
          ...interaction,
        },
        channels,
        deferUpdate
      );
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
