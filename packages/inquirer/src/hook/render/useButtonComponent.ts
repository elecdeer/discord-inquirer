import { NonLinkButton } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useCustomId } from "../state/useCustomId";

import type { ButtonComponentBuilder } from "../../adaptor";

export const useButtonComponent = (param: {
  onClick?: () => void;
}): ButtonComponentBuilder<{
  customId: string;
}> => {
  const customId = useCustomId("button");

  useButtonEvent(customId, async (_, deferUpdate) => {
    await deferUpdate();
    param.onClick?.();
  });

  return NonLinkButton({ customId });
};
