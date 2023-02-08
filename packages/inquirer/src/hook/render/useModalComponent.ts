import { NonLinkButton } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useModal } from "../effect/useModal";
import { useCustomId } from "../state/useCustomId";

import type { NonLinkButtonComponentBuilder } from "../../adaptor";
import type { UseModalParam } from "../effect/useModal";

export type UseModalComponentResult<TKey extends string> = [
  result: Record<TKey, string> | null,
  Button: NonLinkButtonComponentBuilder<{
    customId: string;
  }>
];

/**
 * モーダルを開くボタンとモーダルの結果を返すrenderHook
 * @param onSubmit モーダルの結果が返ってきたときに実行されるハンドラ
 * @param title モーダルのタイトル
 * @param components モーダルに表示するコンポーネント
 * @returns [result, NonLinkButtonComponentBuilder]
 */
export const useModalComponent = <TKey extends string>({
  onSubmit,
  title,
  components,
}: UseModalParam<TKey>): UseModalComponentResult<TKey> => {
  const customId = useCustomId("modalButton");
  const [result, openModal] = useModal({
    onSubmit,
    components,
    title,
  });

  useButtonEvent(customId, async (interaction) => {
    openModal(interaction.id, interaction.token);
  });

  return [
    result,
    NonLinkButton({
      customId: customId,
    }),
  ];
};
