import { useEffect } from "./useEffect";
import { isAdaptorButtonInteraction, messageFacade } from "../../adaptor";
import { batchDispatchAsync } from "../../core/hookContext";
import { useAdaptor, useHookContext } from "../core/useHookContext";

import type { AdaptorInteractionBase } from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useButtonEvent = (
  customId: string,
  handle: (
    interaction: Readonly<AdaptorInteractionBase>,
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const ctx = useHookContext();
  const adaptor = useAdaptor();

  useEffect(() => {
    const facade = messageFacade(adaptor);

    const clear = adaptor.subscribeInteraction((interaction) => {
      if (!isAdaptorButtonInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      void batchDispatchAsync(ctx, async () => {
        await handle(interaction, deferUpdate);
      });
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
