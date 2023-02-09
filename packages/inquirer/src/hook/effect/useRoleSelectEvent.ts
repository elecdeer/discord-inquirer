import { useEffect } from "./useEffect";
import { isAdaptorRoleSelectInteraction, messageFacade } from "../../adaptor";
import { batchDispatchAsync } from "../../core/hookContext";
import { useAdaptor, useHookContext } from "../core/useHookContext";

import type {
  AdaptorRole,
  AdaptorRoleSelectInteraction,
  Snowflake,
} from "../../adaptor";
import type { Awaitable } from "../../util/types";

export const useRoleSelectEvent = (
  customId: Snowflake,
  handle: (
    interaction: Readonly<AdaptorRoleSelectInteraction>,
    values: readonly AdaptorRole[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const ctx = useHookContext();
  const adaptor = useAdaptor();

  useEffect(() => {
    const facade = messageFacade(adaptor);

    const clear = adaptor.subscribeInteraction((interaction) => {
      if (!isAdaptorRoleSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      const roles = interaction.data.values.map(
        (id) => interaction.data.resolved.roles[id]
      );

      void batchDispatchAsync(ctx, async () => {
        await handle(interaction, roles, deferUpdate);
      });
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
