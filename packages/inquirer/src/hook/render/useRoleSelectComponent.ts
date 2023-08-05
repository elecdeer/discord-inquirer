import assert from "node:assert";

import { RoleSelect } from "../../adaptor";
import { useObserveValue } from "../effect/useObserveValue";
import { useRoleSelectEvent } from "../effect/useRoleSelectEvent";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  AdaptorRole,
  RoleSelectComponentBuilder,
  AdaptorRoleSelectInteraction,
} from "../../adaptor";

export type UseRoleSelectComponentResult = [
  selectedResult: AdaptorRole[],
  RoleSelect: RoleSelectComponentBuilder<{
    customId: string;
    minValues: number | undefined;
    maxValues: number | undefined;
  }>,
];

export type UseRoleSingleSelectComponentResult = [
  selectedResult: AdaptorRole | null,
  RoleSelect: RoleSelectComponentBuilder<{
    customId: string;
    minValues: 1 | undefined;
    maxValues: 1;
  }>,
];

export type UseRoleSelectComponentParams = {
  onSelected?: (selected: AdaptorRole[]) => void;
  minValues?: number;
  maxValues?: number;
  filter?: (interaction: Readonly<AdaptorRoleSelectInteraction>) => boolean;
};

export type UseRoleSingleSelectComponentParams = {
  onSelected?: (selected: AdaptorRole | null) => void;
  minValues?: 1;
  filter?: (interaction: Readonly<AdaptorRoleSelectInteraction>) => boolean;
};

/**
 * RoleSelectコンポーネントと選択状態を提供するRenderHook
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param maxValues 選択可能なオプションの最大数 (デフォルト: 制限無し)
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 * @param filter interactionに反応するかどうかのフィルタ falseを返すとdeferUpdateとonSelectedは実行されない
 */
export const useRoleSelectComponent = ({
  onSelected,
  maxValues,
  minValues,
  filter = (_) => true,
}: UseRoleSelectComponentParams = {}): UseRoleSelectComponentResult => {
  const customId = useCustomId("roleSelect");

  const [selected, setSelected] = useState<AdaptorRole[]>([]);

  const markChanged = useObserveValue(selected, onSelected);

  useRoleSelectEvent(customId, async (interaction, roles, deferUpdate) => {
    if (!filter(interaction)) return;

    await deferUpdate();

    setSelected([...roles]);
    markChanged();
  });

  return [
    selected,
    RoleSelect({
      customId,
      minValues: minValues,
      maxValues: maxValues,
    }),
  ];
};

/**
 * RoleSelectコンポーネントと選択状態を提供するRenderHook
 * useRoleSelectComponentの単一選択版
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 * @param filter interactionに反応するかどうかのフィルタ falseを返すとdeferUpdateとonSelectedは実行されない
 */
export const useRoleSingleSelectComponent = ({
  onSelected,
  minValues,
  filter,
}: UseRoleSingleSelectComponentParams = {}): UseRoleSingleSelectComponentResult => {
  const [selected, Select] = useRoleSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      onSelected?.(selected[0] ?? null);
    },
    minValues: minValues,
    maxValues: 1,
    filter,
  });

  return [selected[0] ?? null, Select];
};
