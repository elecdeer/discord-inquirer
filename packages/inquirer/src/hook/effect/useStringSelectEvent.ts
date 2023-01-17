import { useEffect } from "./useEffect";
import { isAdaptorStringSelectInteraction, messageFacade } from "../../adaptor";
import { getHookContext } from "../../core/hookContext";

import type { AdaptorInteractionBase } from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useStringSelectEvent = (
  customId: string,
  handle: (
    interaction: AdaptorInteractionBase,
    values: string[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adapter = getHookContext().adaptor;
  useEffect(() => {
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
      if (!isAdaptorStringSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      handle(
        {
          ...interaction,
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
