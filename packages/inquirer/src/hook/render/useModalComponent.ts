import { NonLinkButton } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useModal } from "../effect/useModal";
import { useCustomId } from "../state/useCustomId";

import type {
  NonLinkButtonComponentBuilder,
  AdaptorButtonInteraction,
} from "../../adaptor";
import type { UseModalParam } from "../effect/useModal";

export type UseModalComponentParam<TKey extends string> =
  UseModalParam<TKey> & {
    filter?: (interaction: Readonly<AdaptorButtonInteraction>) => boolean;
  };

export type UseModalComponentResult<TKey extends string> = [
  result: Record<TKey, string> | null,
  Button: NonLinkButtonComponentBuilder<{
    customId: string;
  }>,
];

/**
 * モーダルを開くボタンとモーダルの結果を返すrenderHook
 * @param onSubmit モーダルの結果が返ってきたときに実行されるハンドラ
 * @param title モーダルのタイトル
 * @param components モーダルに表示するコンポーネント
 * @param filter interactionに反応するかどうかのフィルタ falseを返すとdeferUpdateとonClickは実行されない
 * @returns [result, NonLinkButtonComponentBuilder]
 */
export const useModalComponent = <TKey extends string>({
  onSubmit,
  title,
  components,
  filter = (_) => true,
}: UseModalComponentParam<TKey>): UseModalComponentResult<TKey> => {
  const customId = useCustomId("modalButton");
  const [result, openModal] = useModal({
    onSubmit,
    components,
    title,
  });

  useButtonEvent(customId, async (interaction) => {
    if (!filter(interaction)) return;

    openModal(interaction.id, interaction.token);
  });

  return [
    result,
    NonLinkButton({
      customId: customId,
    }),
  ];
};
