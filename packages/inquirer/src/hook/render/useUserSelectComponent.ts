import assert from "node:assert";

import { UserSelect } from "../../adaptor";
import { useObserveValue } from "../effect/useObserveValue";
import { useUserSelectEvent } from "../effect/useUserSelectEvent";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type { UserSelectComponentBuilder } from "../../adaptor";
import type { UserSelectResultValue } from "../effect/useUserSelectEvent";

export type UseUserSelectComponentResult = [
  selectResult: UserSelectResultValue[],
  UserSelect: UserSelectComponentBuilder<{
    customId: string;
    minValues: number | undefined;
    maxValues: number | undefined;
  }>
];

export type UseUserSingleSelectComponentResult = [
  selectResult: UserSelectResultValue | null,
  UserSelect: UserSelectComponentBuilder<{
    customId: string;
    minValues: 1 | undefined;
    maxValues: 1;
  }>
];

export type UseUserSelectComponentParams = {
  onSelected?: (selected: UserSelectResultValue[]) => void;
  minValues?: number;
  maxValues?: number;
};

export type UseUserSingleSelectComponentParams = {
  onSelected?: (selected: UserSelectResultValue | null) => void;
  minValues?: 1;
};

/**
 * UserSelectコンポーネントと選択状態を提供するRenderHook
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param maxValues 選択可能なオプションの最大数 (デフォルト: 制限無し)
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 */
export const useUserSelectComponent = ({
  onSelected,
  maxValues,
  minValues,
}: UseUserSelectComponentParams = {}): UseUserSelectComponentResult => {
  const customId = useCustomId("userSelect");

  const [selected, setSelected] = useState<UserSelectResultValue[]>([]);

  const markChanged = useObserveValue(selected, onSelected);

  useUserSelectEvent(customId, async (_, users, deferUpdate) => {
    await deferUpdate();

    setSelected([...users]);
    markChanged();
  });

  return [
    selected,
    UserSelect({
      customId,
      minValues: minValues,
      maxValues: maxValues,
    }),
  ];
};

/**
 * UserSelectコンポーネントと選択状態を提供するRenderHook
 * useUserSelectComponentの単数選択版
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 */
export const useUserSingleSelectComponent = ({
  onSelected,
  minValues,
}: UseUserSingleSelectComponentParams = {}): UseUserSingleSelectComponentResult => {
  const [selected, Select] = useUserSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      onSelected?.(selected[0] ?? null);
    },
    minValues: minValues,
    maxValues: 1,
  });

  return [selected[0] ?? null, Select];
};
