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
  }>
];

export type UseUserSingleSelectComponentResult = [
  selectResult: UserSelectResultValue | null,
  UserSelect: UserSelectComponentBuilder<{
    customId: string;
    maxValues: 1;
  }>
];

export const useUserSelectComponent = (
  param: {
    onSelected?: (selected: UserSelectResultValue[]) => void;
  } = {}
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
    }),
  ];
};

export const useUserSingleSelectComponent = (
  param: {
    onSelected?: (selected: UserSelectResultValue | null) => void;
  } = {}
): UseUserSingleSelectComponentResult => {
  const [selected, Select] = useUserSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      param.onSelected?.(selected[0] ?? null);
    },
  });

  return [
    selected[0] ?? null,
    Select({
      maxValues: 1,
    }),
  ];
};
