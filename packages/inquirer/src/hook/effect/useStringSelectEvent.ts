import { useEffect } from "./useEffect";
import { isAdaptorStringSelectInteraction, messageFacade } from "../../adaptor";
import { batchDispatchAsync, getHookContext } from "../../core/hookContext";

import type { AdaptorInteractionBase } from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useStringSelectEvent = (
  customId: string,
  handle: (
    interaction: Readonly<AdaptorInteractionBase>,
    values: readonly string[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const ctx = getHookContext();
  const adapter = ctx.adaptor;

  useEffect(() => {
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
      if (!isAdaptorStringSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      void batchDispatchAsync(ctx, async () => {
        await handle(interaction, interaction.data.values, deferUpdate);
      });
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
