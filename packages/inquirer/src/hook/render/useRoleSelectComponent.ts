import assert from "node:assert";

import { RoleSelect } from "../../adaptor";
import { useObserveValue } from "../effect/useObserveValue";
import { useRoleSelectEvent } from "../effect/useRoleSelectEvent";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type { AdaptorRole, RoleSelectComponentBuilder } from "../../adaptor";

export type UseRoleSelectComponentResult = [
  selectedResult: AdaptorRole[],
  RoleSelect: RoleSelectComponentBuilder<{
    customId: string;
    minValues: number | undefined;
    maxValues: number | undefined;
  }>
];

export type UseRoleSingleSelectComponentResult = [
  selectedResult: AdaptorRole | null,
  RoleSelect: RoleSelectComponentBuilder<{
    customId: string;
    minValues: 1 | undefined;
    maxValues: 1;
  }>
];

export type UseRoleSelectComponentParams = {
  onSelected?: (selected: AdaptorRole[]) => void;
  minValues?: number;
  maxValues?: number;
};

export type UseRoleSingleSelectComponentParams = {
  onSelected?: (selected: AdaptorRole | null) => void;
  minValues?: 1;
};

export const useRoleSelectComponent = (
  params: UseRoleSelectComponentParams = {}
): UseRoleSelectComponentResult => {
  const customId = useCustomId("roleSelect");

  const [selected, setSelected] = useState<AdaptorRole[]>([]);

  const markChanged = useObserveValue(selected, params.onSelected);

  useRoleSelectEvent(customId, async (_, roles, deferUpdate) => {
    await deferUpdate();

    setSelected([...roles]);
    markChanged();
  });

  return [
    selected,
    RoleSelect({
      customId,
      minValues: params.minValues,
      maxValues: params.maxValues,
    }),
  ];
};

export const useRoleSingleSelectComponent = (
  param: UseRoleSingleSelectComponentParams = {}
): UseRoleSingleSelectComponentResult => {
  const [selected, Select] = useRoleSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      param.onSelected?.(selected[0] ?? null);
    },
    minValues: param.minValues,
    maxValues: 1,
  });

  return [selected[0] ?? null, Select];
};
