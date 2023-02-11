import { useEffect } from "./useEffect";
import { isAdaptorStringSelectInteraction, messageFacade } from "../../adaptor";
import { useAdaptor } from "../core/useHookContext";

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
  const adaptor = useAdaptor();

  useEffect(() => {
    const facade = messageFacade(adaptor);

    const clear = adaptor.subscribeInteraction(async (interaction) => {
      if (!isAdaptorStringSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      await handle(interaction, interaction.data.values, deferUpdate);
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
