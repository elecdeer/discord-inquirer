import { messageFacade } from "../../adaptor";
import { getHookContext } from "../../core/hookContext";
import { useEffect } from "./useEffect";

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
      if (interaction.type !== "messageComponent") return;
      if (interaction.data.componentType !== "stringSelect") return;
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
