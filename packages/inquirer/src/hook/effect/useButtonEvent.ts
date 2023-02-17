import { useEffect } from "./useEffect";
import { isAdaptorButtonInteraction, messageFacade } from "../../adaptor";
import { useAdaptor } from "../core/useHookContext";

import type { AdaptorInteractionBase } from "../../adaptor";
import type { Awaitable } from "../../util/types";

/**
 * Buttonコンポーネントが押されたときに送られるInteractionイベントを扱うhook
 * @param customId ButtonコンポーネントのcustomId
 * @param handle Interactionを受け取ったときに実行される関数
 *
 * @see useButtonComponent
 */
export const useButtonEvent = (
  customId: string,
  handle: (
    interaction: Readonly<AdaptorInteractionBase>,
    deferUpdate: () => Promise<void>
  ) => Awaitable<void>
): void => {
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
