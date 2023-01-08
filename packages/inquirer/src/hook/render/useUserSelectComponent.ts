import assert from "node:assert";

import { UserSelect } from "../../adaptor";
import { useEffect } from "../effect/useEffect";
import { useUserSelectEvent } from "../effect/useUserSelectEvent";
import { useCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";
import { useState } from "../state/useState";

import type { AdaptorUserSelectComponent } from "../../adaptor";
import type { FulfilledCurriedBuilder } from "../../util/curriedBuilder";
import type { UserSelectResultValue } from "../effect/useUserSelectEvent";

export type UseUserSelectComponentResult = [
  selectResult: UserSelectResultValue[],
  UserSelect: FulfilledCurriedBuilder<
    AdaptorUserSelectComponent,
    {
      type: "userSelect";
      customId: string;
    },
    AdaptorUserSelectComponent
  >
];

export type UseUserSingleSelectComponentResult = [
  selectResult: UserSelectResultValue | null,
  UserSelect: FulfilledCurriedBuilder<
    AdaptorUserSelectComponent,
    {
      type: "userSelect";
      customId: string;
      maxValues: 1;
    },
    AdaptorUserSelectComponent
  >
];

export const useUserSelectComponent = (
  param: {
    onSelected?: (selected: UserSelectResultValue[]) => void;
  } = {}
): UseUserSelectComponentResult => {
  const customId = useCustomId("userSelect");

  const [selected, setSelected] = useState<UserSelectResultValue[]>([]);

  useUserSelectEvent(customId, async (_, users, deferUpdate) => {
    await deferUpdate();

    setSelected(users);
    valueChanged.current = true;
  });

  const valueChanged = useRef(false);
  useEffect(() => {
    if (valueChanged.current) {
      param.onSelected?.(selected);
      valueChanged.current = false;
    }
  }, [selected, param.onSelected]);

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
