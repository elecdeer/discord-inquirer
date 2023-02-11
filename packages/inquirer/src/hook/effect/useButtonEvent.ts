import { useEffect } from "./useEffect";
import { isAdaptorButtonInteraction, messageFacade } from "../../adaptor";
import { useAdaptor } from "../core/useHookContext";

import type { AdaptorInteractionBase } from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useButtonEvent = (
  customId: string,
  handle: (
    interaction: Readonly<AdaptorInteractionBase>,
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adaptor = useAdaptor();

  useEffect(() => {
    const facade = messageFacade(adaptor);

    const clear = adaptor.subscribeInteraction(async (interaction) => {
      if (!isAdaptorButtonInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      await handle(interaction, deferUpdate);
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
