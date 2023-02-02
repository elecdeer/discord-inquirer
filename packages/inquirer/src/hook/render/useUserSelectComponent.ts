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

export const useUserSelectComponent = (
  param: UseUserSelectComponentParams = {}
): UseUserSelectComponentResult => {
  const customId = useCustomId("userSelect");

  const [selected, setSelected] = useState<UserSelectResultValue[]>([]);

  const markChanged = useObserveValue(selected, param.onSelected);

  useUserSelectEvent(customId, async (_, users, deferUpdate) => {
    await deferUpdate();

    setSelected([...users]);
    markChanged();
  });

  return [
    selected,
    UserSelect({
      customId,
      minValues: param.minValues,
      maxValues: param.maxValues,
    }),
  ];
};

export const useUserSingleSelectComponent = (
  param: UseUserSingleSelectComponentParams = {}
): UseUserSingleSelectComponentResult => {
  const [selected, Select] = useUserSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      param.onSelected?.(selected[0] ?? null);
    },
    minValues: param.minValues,
    maxValues: 1,
  });

  return [selected[0] ?? null, Select];
};
