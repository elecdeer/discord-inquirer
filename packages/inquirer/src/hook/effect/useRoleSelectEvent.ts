import { useEffect } from "./useEffect";
import { isAdaptorRoleSelectInteraction, messageFacade } from "../../adaptor";
import { useAdaptor } from "../core/useHookContext";

import type {
  AdaptorRole,
  AdaptorRoleSelectInteraction,
  Snowflake,
} from "../../adaptor";
import type { Awaitable } from "../../util/types";

/**
 * RoleSelectコンポーネントが押されたときに送られるInteractionイベントを扱うhook
 * @param customId RoleSelectコンポーネントのcustomId
 * @param handle Interactionを受け取ったときに実行される関数
 */
export const useRoleSelectEvent = (
  customId: Snowflake,
  handle: (
    interaction: Readonly<AdaptorRoleSelectInteraction>,
    values: readonly AdaptorRole[],
    deferUpdate: () => Promise<void>,
  ) => Awaitable<void>,
): void => {
  const adaptor = useAdaptor();

  useEffect(() => {
    const facade = messageFacade(adaptor);

    const clear = adaptor.subscribeInteraction(async (interaction) => {
      if (!isAdaptorRoleSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      const roles = interaction.data.values.map(
        (id) => interaction.data.resolved.roles[id],
      );

      await handle(interaction, roles, deferUpdate);
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
