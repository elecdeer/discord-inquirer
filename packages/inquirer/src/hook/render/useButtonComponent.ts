import { NonLinkButton } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useCustomId } from "../state/useCustomId";

import type {
  NonLinkButtonComponentBuilder,
  AdaptorButtonInteraction,
} from "../../adaptor";

export type UseButtonComponentParams = {
  onClick?: () => void;
  filter?: (interaction: Readonly<AdaptorButtonInteraction>) => boolean;
};

/**
 * クリック時に何らかのアクションを起こすButtonComponentを作成する
 * @param onClick クリック時に実行されるハンドラ
 * @param filter interactionに反応するかどうかのフィルタ falseを返すとdeferUpdateとonClickは実行されない
 * @returns ButtonComponentBuilder
 */
export const useButtonComponent = ({
  onClick,
  filter = (_) => true,
}: UseButtonComponentParams): NonLinkButtonComponentBuilder<{
  customId: string;
}> => {
  const customId = useCustomId("button");

  useButtonEvent(customId, async (interaction, deferUpdate) => {
    if (!filter(interaction)) return;
    await deferUpdate();
    onClick?.();
  });

  return NonLinkButton({ customId });
};
