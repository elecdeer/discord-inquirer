import assert from "node:assert";

import { UserSelect } from "../../adaptor";
import { useEffect } from "../effect/useEffect";
import { useUserSelectEvent } from "../effect/useUserSelectEvent";
import { useCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";
import { useState } from "../state/useState";

import type { AdaptorUserSelectComponent } from "../../adaptor";
import type { UnfulfilledCurriedBuilder } from "../../util/curriedBuilder";
import type { UserSelectResultValue } from "../effect/useUserSelectEvent";

export type UseUserSelectComponentResult = [
  selectResult: UserSelectResultValue[],
  UserSelect: UnfulfilledCurriedBuilder<
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
  UserSelect: UnfulfilledCurriedBuilder<
    AdaptorUserSelectComponent,
    {
      type: "userSelect";
      customId: string;
      maxValues: 1;
      minValues: 0;
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

  const Select = UserSelect({
    customId,
  });

  return [selected, Select];
};

export const useUserSingleSelectComponent = (
  param: {
    onSelected?: (selected: UserSelectResultValue | null) => void;
  } = {}
): UseUserSingleSelectComponentResult => {
  const customId = useCustomId("userSelect");

  const [selected, setSelected] = useState<UserSelectResultValue | null>(null);

  useUserSelectEvent(customId, async (_, users, deferUpdate) => {
    assert(users.length <= 1);

    await deferUpdate();

    setSelected(users[0] ?? null);
    valueChanged.current = true;
  });

  const valueChanged = useRef(false);
  useEffect(() => {
    if (valueChanged.current) {
      param.onSelected?.(selected);
      valueChanged.current = false;
    }
  }, [selected, param.onSelected]);

  const Select = UserSelect({
    customId,
    maxValues: 1,
    minValues: 0,
  });

  return [selected, Select];
};
