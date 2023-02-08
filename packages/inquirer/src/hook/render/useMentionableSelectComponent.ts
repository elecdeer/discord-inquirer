import assert from "node:assert";

import { MentionableSelect } from "../../adaptor";
import { useMentionableSelectEvent } from "../effect/useMentionableSelectEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type { MentionableSelectComponentBuilder } from "../../adaptor";
import type { MentionableSelectValue } from "../effect/useMentionableSelectEvent";

export type UseMentionableSelectComponentResult = [
  selected: MentionableSelectValue[],
  MentionableSelect: MentionableSelectComponentBuilder<{
    customId: string;
    minValues: number | undefined;
    maxValues: number | undefined;
  }>
];

export type UseMentionableSingleSelectComponentResult = [
  selected: MentionableSelectValue | null,
  MentionableSelect: MentionableSelectComponentBuilder<{
    customId: string;
    minValues: 1 | undefined;
    maxValues: 1;
  }>
];

export type UseMentionableSelectComponentParams = {
  onSelected?: (selected: MentionableSelectValue[]) => void;
  minValues?: number;
  maxValues?: number;
};

export type UseMentionableSingleSelectComponentParams = {
  onSelected?: (selected: MentionableSelectValue | null) => void;
  minValues?: 1;
};

/**
 * MentionableSelectコンポーネントと選択状態を提供するRenderHook
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 * @param maxValues 選択可能なオプションの最大数 (デフォルト: 制限無し)
 */
export const useMentionableSelectComponent = ({
  onSelected,
  minValues,
  maxValues,
}: UseMentionableSelectComponentParams = {}): UseMentionableSelectComponentResult => {
  const customId = useCustomId("mentionableSelect");

  const [selected, setSelected] = useState<MentionableSelectValue[]>([]);
  const markChanged = useObserveValue(selected, onSelected);

  useMentionableSelectEvent(customId, async (_, userOrRoles, deferUpdate) => {
    await deferUpdate();

    setSelected([...userOrRoles]);
    markChanged();
  });

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
 */
export const useMentionableSingleSelectComponent = ({
  onSelected,
  minValues,
}: UseMentionableSingleSelectComponentParams = {}): UseMentionableSingleSelectComponentResult => {
  const [selected, MentionableSelect] = useMentionableSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      onSelected?.(selected[0] ?? null);
    },
    minValues: minValues,
    maxValues: 1,
  });

  return [selected[0] ?? null, MentionableSelect];
};
