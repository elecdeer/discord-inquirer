import { useEffect } from "./useEffect";
import { isAdaptorButtonInteraction, messageFacade } from "../../adaptor";
import { getHookContext } from "../../core/hookContext";

import type { AdaptorInteractionBase } from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useButtonEvent = (
  customId: string,
  handle: (
    interaction: AdaptorInteractionBase,
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adapter = getHookContext().adaptor;
  useEffect(() => {
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
      if (!isAdaptorButtonInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      handle(
        {
          ...interaction,
        },
        deferUpdate
      );
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
