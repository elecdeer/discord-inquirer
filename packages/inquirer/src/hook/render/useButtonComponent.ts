import { NonLinkButton } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useCustomId } from "../state/useCustomId";

import type {
  AdaptorNonLinkButtonComponent,
  NonLinkButtonComponentBuilder,
} from "../../adaptor";

export type UseButtonComponentParams = {
  /**
   * クリック時に呼ばれるハンドラ
   */
  onClick?: () => void;
};

/**
 * クリック時に何らかのアクションを起こすButtonComponentを作成する
 * @param param
 */
export const useButtonComponent = (
  param: UseButtonComponentParams
): NonLinkButtonComponentBuilder<{
  customId: string;
  style: AdaptorNonLinkButtonComponent["style"];
}> => {
  const customId = useCustomId("button");

  useButtonEvent(customId, async (_, deferUpdate) => {
    await deferUpdate();
    param.onClick?.();
  });

  return NonLinkButton({ customId, style: "primary" });
};
