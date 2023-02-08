import { NonLinkButton } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useCustomId } from "../state/useCustomId";

import type { NonLinkButtonComponentBuilder } from "../../adaptor";

export type UseButtonComponentParams = {
  onClick?: () => void;
};

/**
 * クリック時に何らかのアクションを起こすButtonComponentを作成する
 * @param onClick クリック時に実行されるハンドラ
 * @returns ButtonComponentBuilder
 */
export const useButtonComponent = ({
  onClick,
}: UseButtonComponentParams): NonLinkButtonComponentBuilder<{
  customId: string;
}> => {
  const customId = useCustomId("button");

  useButtonEvent(customId, async (_, deferUpdate) => {
    await deferUpdate();
    onClick?.();
  });

  return NonLinkButton({ customId });
};
