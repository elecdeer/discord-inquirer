import { useEffect } from "./useEffect";
import { isAdaptorUserSelectInteraction, messageFacade } from "../../adaptor";
import { useAdaptor } from "../core/useHookContext";

import type {
  AdaptorPartialMember,
  AdaptorUser,
  AdaptorUserSelectInteraction,
} from "../../adaptor";
import type { Awaitable } from "../../util/types";

export type UserSelectResultValue = AdaptorUser & {
  member: AdaptorPartialMember;
};

/**
 * UserSelectコンポーネントが押されたときに送られるInteractionイベントを扱うhook
 * @param customId UserSelectコンポーネントのcustomId
 * @param handle Interactionを受け取ったときに実行される関数
 * @see useUserSelectComponent
 */
export const useUserSelectEvent = (
  customId: string,
  handle: (
    interaction: Readonly<AdaptorUserSelectInteraction>,
    users: readonly UserSelectResultValue[],
    deferUpdate: () => Promise<void>,
  ) => Awaitable<void>,
): void => {
  const adaptor = useAdaptor();

  useEffect(() => {
    const facade = messageFacade(adaptor);

    const clear = adaptor.subscribeInteraction(async (interaction) => {
      if (!isAdaptorUserSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      const users = interaction.data.values.map((id) => {
        const user = interaction.data.resolved.users[id];
        const member = interaction.data.resolved.members[id];
        return {
          ...user,
          member: member,
        };
      });

      await handle(interaction, users, deferUpdate);
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
