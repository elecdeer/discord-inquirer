import assert from "node:assert";

import { MentionableSelect } from "../../adaptor";
import { useMentionableSelectEvent } from "../effect/useMentionableSelectEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type { AdaptorMentionableSelectComponent } from "../../adaptor";
import type { FulfilledCurriedBuilder } from "../../util/curriedBuilder";
import type { MentionableSelectValue } from "../effect/useMentionableSelectEvent";

export type UseMentionableSelectComponentResult = [
  selected: MentionableSelectValue[],
  MentionableSelect: FulfilledCurriedBuilder<
    AdaptorMentionableSelectComponent,
    {
      type: "mentionableSelect";
      customId: string;
    },
    AdaptorMentionableSelectComponent
  >
];

export type UseMentionableSingleSelectComponentResult = [
  selected: MentionableSelectValue | null,
  MentionableSelect: FulfilledCurriedBuilder<
    AdaptorMentionableSelectComponent,
    {
      type: "mentionableSelect";
      customId: string;
      maxValues: 1;
    },
    AdaptorMentionableSelectComponent
  >
];

export const useMentionableSelectComponent = (
  params: {
    onSelected?: (selected: MentionableSelectValue[]) => void;
  } = {}
): UseMentionableSelectComponentResult => {
  const customId = useCustomId("mentionableSelect");

  const [selected, setSelected] = useState<MentionableSelectValue[]>([]);
  const markChanged = useObserveValue(selected, params.onSelected);

  useMentionableSelectEvent(customId, async (_, userOrRoles, deferUpdate) => {
    await deferUpdate();

    setSelected(userOrRoles);
    markChanged();
  });

  return [
    selected,
    MentionableSelect({
      customId,
    }),
  ];
};

export const useMentionableSingleSelectComponent = (
  params: {
    onSelected?: (selected: MentionableSelectValue | null) => void;
  } = {}
): UseMentionableSingleSelectComponentResult => {
  const [selected, MentionableSelect] = useMentionableSelectComponent({
    onSelected: (selected) => {
      assert(selected.length <= 1);
      params.onSelected?.(selected[0] ?? null);
    },
  });

  return [
    selected[0] ?? null,
    MentionableSelect({
      maxValues: 1,
    }),
  ];
};
