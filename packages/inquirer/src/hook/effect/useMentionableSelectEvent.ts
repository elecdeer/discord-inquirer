import { useEffect } from "./useEffect";
import {
  isAdaptorMentionableSelectInteraction,
  messageFacade,
} from "../../adaptor";
import { useAdaptor } from "../core/useHookContext";

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
    interaction: Readonly<AdaptorMentionableSelectInteraction>,
    userOrRoles: readonly MentionableSelectValue[],
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
) => {
  const adaptor = useAdaptor();

  useEffect(() => {
    const facade = messageFacade(adaptor);

    const clear = adaptor.subscribeInteraction(async (interaction) => {
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

      await handle(interaction, values, deferUpdate);
    });

    return () => {
      clear();
    };
  }, [customId, handle]);
};
