import {
  isAdaptorMentionableSelectInteraction,
  messageFacade,
} from "../../adaptor";
import { getHookContext } from "../../core/hookContext";
import { useEffect } from "./useEffect";

import type {
  AdaptorMentionableSelectInteraction,
  AdaptorRole,
  AdaptorUser,
  Snowflake,
} from "../../adaptor";
import type { Awaitable } from "../../util/types";

export type MentionableSelectValue =
  | ({
      type: "role";
    } & AdaptorRole)
  | ({
      type: "user";
    } & AdaptorUser);

export const useMentionableSelectEvent = (
  customId: Snowflake,
  handle: (
    interaction: AdaptorMentionableSelectInteraction,
    userOrRoles: MentionableSelectValue[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adapter = getHookContext().adaptor;
  useEffect(() => {
    const facade = messageFacade(adapter);

    const clear = adapter.subscribeInteraction((interaction) => {
      if (!isAdaptorMentionableSelectInteraction(interaction)) return;
      if (interaction.data.customId !== customId) return;

      const deferUpdate = async () => {
        await facade.deferUpdate(interaction.id, interaction.token);
      };

      const values = interaction.data.values
        .map((id) => {
          const role = interaction.data.resolved.roles[id];
          if (role !== undefined) {
            return {
              type: "role",
              ...role,
            };
          }

          const user = interaction.data.resolved.users[id];
          if (user !== undefined) {
            return {
              type: "user",
              ...user,
            };
          }
          return undefined;
        })
        .filter(
          (value): value is MentionableSelectValue => value !== undefined
        );
      handle(
        {
          ...interaction,
        },
        values,
        deferUpdate
      );
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
