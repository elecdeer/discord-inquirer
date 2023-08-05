import assert from "node:assert";

import { MentionableSelect } from "../../adaptor";
import { useMentionableSelectEvent } from "../effect/useMentionableSelectEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  MentionableSelectComponentBuilder,
  AdaptorMentionableSelectInteraction,
} from "../../adaptor";
import type { MentionableSelectValue } from "../effect/useMentionableSelectEvent";

export type UseMentionableSelectComponentResult = [
  selected: MentionableSelectValue[],
  MentionableSelect: MentionableSelectComponentBuilder<{
    customId: string;
    minValues: number | undefined;
    maxValues: number | undefined;
  }>,
];

export type UseMentionableSingleSelectComponentResult = [
  selected: MentionableSelectValue | null,
  MentionableSelect: MentionableSelectComponentBuilder<{
    customId: string;
    minValues: 1 | undefined;
    maxValues: 1;
  }>,
];

export type UseMentionableSelectComponentParams = {
  onSelected?: (selected: MentionableSelectValue[]) => void;
  minValues?: number;
  maxValues?: number;
  filter?: (
    interaction: Readonly<AdaptorMentionableSelectInteraction>,
  ) => boolean;
};

export type UseMentionableSingleSelectComponentParams = {
  onSelected?: (selected: MentionableSelectValue | null) => void;
  minValues?: 1;
  filter?: (
    interaction: Readonly<AdaptorMentionableSelectInteraction>,
  ) => boolean;
};

/**
 * MentionableSelectコンポーネントと選択状態を提供するRenderHook
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 * @param maxValues 選択可能なオプションの最大数 (デフォルト: 制限無し)
 * @param filter interactionに反応するかどうかのフィルタ falseを返すとdeferUpdateとonConfirmは実行されない
 */
export const useMentionableSelectComponent = ({
  onSelected,
  minValues,
  maxValues,
  filter = (_) => true,
}: UseMentionableSelectComponentParams = {}): UseMentionableSelectComponentResult => {
  const customId = useCustomId("mentionableSelect");

  const [selected, setSelected] = useState<MentionableSelectValue[]>([]);
  const markChanged = useObserveValue(selected, onSelected);

  useMentionableSelectEvent(
    customId,
    async (interaction, userOrRoles, deferUpdate) => {
      if (!filter(interaction)) return;

      await deferUpdate();

      setSelected([...userOrRoles]);
      markChanged();
    },
  );

  return [
    selected,
    MentionableSelect({
      customId,
      minValues: minValues,
      maxValues: maxValues,
    }),
  ];
};

/**
 * MentionableSelectコンポーネントと選択状態を提供するRenderHook
 * useMentionableSelectComponentの単数選択版
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 * @param filter interactionに反応するかどうかのフィルタ falseを返すとdeferUpdateとonConfirmは実行されない
 */
export const useMentionableSingleSelectComponent = ({
  onSelected,
  minValues,
  filter,
}: UseMentionableSingleSelectComponentParams = {}): UseMentionableSingleSelectComponentResult => {
  const [selected, MentionableSelect] = useMentionableSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      onSelected?.(selected[0] ?? null);
    },
    minValues: minValues,
    maxValues: 1,
    filter: filter,
  });

  return [selected[0] ?? null, MentionableSelect];
};
