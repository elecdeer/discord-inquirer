import { Button } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useModal } from "../effect/useModal";
import { useCustomId } from "../state/useCustomId";

import type { ButtonComponentBuilder } from "../../adaptor";
import type { UseModalParam } from "../effect/useModal";

export type UseModalComponentResult<TKey extends string> = [
  result: Record<TKey, string> | null,
  Button: ButtonComponentBuilder<{
    customId: string;
  }>
];

export const useModalComponent = <TKey extends string>(
  param: UseModalParam<TKey>
): UseModalComponentResult<TKey> => {
  const customId = useCustomId("modalButton");
  const [result, openModal] = useModal(param);

  useButtonEvent(customId, async (interaction) => {
    openModal(interaction.id, interaction.token);
  });

  return [
    result,
    Button({
      customId: customId,
    }),
  ];
};
