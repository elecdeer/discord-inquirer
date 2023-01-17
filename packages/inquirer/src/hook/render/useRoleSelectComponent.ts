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
  }>
];

export type UseRoleSingleSelectComponentResult = [
  selectedResult: AdaptorRole | null,
  RoleSelect: RoleSelectComponentBuilder<{
    customId: string;
    maxValues: 1;
  }>
];

export const useRoleSelectComponent = (
  params: {
    onSelected?: (selected: AdaptorRole[]) => void;
  } = {}
): UseRoleSelectComponentResult => {
  const customId = useCustomId("roleSelect");

  const [selected, setSelected] = useState<AdaptorRole[]>([]);

  const markChanged = useObserveValue(selected, params.onSelected);

  useRoleSelectEvent(customId, async (_, roles, deferUpdate) => {
    await deferUpdate();

    setSelected(roles);
    markChanged();
  });

  return [
    selected,
    RoleSelect({
      customId,
    }),
  ];
};

export const useRoleSingleSelectComponent = (
  params: {
    onSelected?: (selected: AdaptorRole | null) => void;
  } = {}
): UseRoleSingleSelectComponentResult => {
  const [selected, Select] = useRoleSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      params.onSelected?.(selected[0] ?? null);
    },
  });

  return [
    selected[0] ?? null,
    Select({
      maxValues: 1,
    }),
  ];
};
