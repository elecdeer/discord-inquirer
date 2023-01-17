import { useEffect } from "./useEffect";
import { isAdaptorRoleSelectInteraction, messageFacade } from "../../adaptor";
import { getHookContext } from "../../core/hookContext";

import type {
  AdaptorRole,
  Snowflake,
  AdaptorRoleSelectInteraction,
} from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useRoleSelectEvent = (
  customId: Snowflake,
  handle: (
    interaction: AdaptorRoleSelectInteraction,
    values: AdaptorRole[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adapter = getHookContext().adaptor;
  useEffect(() => {
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
      if (!isAdaptorRoleSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      const roles = interaction.data.values.map(
        (id) => interaction.data.resolved.roles[id]
      );
      handle(
        {
          ...interaction,
        },
        roles,
        deferUpdate
      );
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
