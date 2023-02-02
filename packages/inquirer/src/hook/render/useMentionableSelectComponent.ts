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

export const useMentionableSelectComponent = (
  params: UseMentionableSelectComponentParams = {}
): UseMentionableSelectComponentResult => {
  const customId = useCustomId("mentionableSelect");

  const [selected, setSelected] = useState<MentionableSelectValue[]>([]);
  const markChanged = useObserveValue(selected, params.onSelected);

  useMentionableSelectEvent(customId, async (_, userOrRoles, deferUpdate) => {
    await deferUpdate();

    setSelected([...userOrRoles]);
    markChanged();
  });

  return [
    selected,
    MentionableSelect({
      customId,
      minValues: params.minValues,
      maxValues: params.maxValues,
    }),
  ];
};

export const useMentionableSingleSelectComponent = (
  param: UseMentionableSingleSelectComponentParams = {}
): UseMentionableSingleSelectComponentResult => {
  const [selected, MentionableSelect] = useMentionableSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      param.onSelected?.(selected[0] ?? null);
    },
    minValues: param.minValues,
    maxValues: 1,
  });

  return [selected[0] ?? null, MentionableSelect];
};
