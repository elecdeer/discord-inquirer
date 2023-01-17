import { useEffect } from "./useEffect";
import { isAdaptorUserSelectInteraction, messageFacade } from "../../adaptor";
import { getHookContext } from "../../core/hookContext";

import type {
  AdaptorUserSelectInteraction,
  AdaptorUser,
  AdaptorPartialMember,
} from "../../adaptor";
import type { Awaitable } from "../../util/types";

export type UserSelectResultValue = AdaptorUser & {
  member: AdaptorPartialMember;
};

export const useUserSelectEvent = (
  customId: string,
  handle: (
    interaction: AdaptorUserSelectInteraction,
    users: UserSelectResultValue[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adapter = getHookContext().adaptor;
  useEffect(() => {
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
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

      handle(
        {
          ...interaction,
        },
        users,
        deferUpdate
      );
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
