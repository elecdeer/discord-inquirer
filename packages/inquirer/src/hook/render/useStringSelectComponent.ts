import assert from "node:assert";

import { StringSelect } from "../../adaptor";
import { useObserveValue } from "../effect/useObserveValue";
import { useStringSelectEvent } from "../effect/useStringSelectEvent";
import { useCollection } from "../state/useCollection";
import { useCustomId } from "../state/useCustomId";

import type {
  AdaptorSelectOption,
  AdaptorStringSelectComponent,
} from "../../adaptor";
import type { FulfilledCurriedBuilder } from "../../util/curriedBuilder";
import type { SetOptional } from "type-fest";

export type StringSelectItem<T> = Omit<AdaptorSelectOption<T>, "value"> & {
  key: string;
  payload: T;
  inactive?: boolean;
};

export type PartialStringSelectItem<T> = SetOptional<
  StringSelectItem<T>,
  "key"
>;

export type StringSelectItemResult<T> = StringSelectItem<T> & {
  selected: boolean;
};

export type UseStringSelectComponentResult<T> = [
  selectResult: StringSelectItemResult<T>[],
  StringSelect: FulfilledCurriedBuilder<
    AdaptorStringSelectComponent<T>,
    {
      type: "stringSelect";
      customId: string;
      options: StringSelectItemResult<T>[];
    },
    AdaptorStringSelectComponent<T>
  >
];

export type UseStringSingleSelectComponentResult<T> = [
  selectResult: StringSelectItemResult<T> | null,
  StringSelect: FulfilledCurriedBuilder<
    AdaptorStringSelectComponent<T>,
    {
      type: "stringSelect";
      customId: string;
      options: StringSelectItemResult<T>[];
    },
    AdaptorStringSelectComponent<T>
  >
];

export const useStringSelectComponent = <T>(param: {
  options: readonly PartialStringSelectItem<T>[];
  onSelected?: (selected: StringSelectItemResult<T>[]) => void;
}): UseStringSelectComponentResult<T> => {
  const customId = useCustomId("stringSelect");

  const items = initialSelectItems(param.options);

  const { setEach, get } = useCollection(
    items.map((item) => [
      item.key,
      {
        key: item.key,
        selected: item.selected,
      },
    ])
  );
  const result = items.map((item) => ({
    ...item,
    selected: get(item.key)?.selected ?? false,
  }));

  const markChanged = useObserveValue(result, param.onSelected);

  useStringSelectEvent(customId, async (_, values, deferUpdate) => {
    await deferUpdate();

    setEach((prev, key) => {
      const selected = values.includes(key);
      if (prev.selected == selected) {
        return prev;
      } else {
        markChanged();
        return {
          ...prev,
          selected,
        };
      }
    });
  });

  const renderComponent = StringSelect({
    customId,
    options: items
      .map((item) => ({
        ...item,
        value: item.key,
        default: get(item.key)?.selected ?? false,
      }))
      .filter((item) => !(item.inactive ?? false)),
  });

  return [result, renderComponent];
};

const initialSelectItems = <T>(
  items: readonly PartialStringSelectItem<T>[]
): StringSelectItemResult<T>[] => {
  return items.map((item, index) => {
    return {
      ...item,
      selected: item.default ?? false,
      key: item.key ?? `select-item-${index}`,
    };
  });
};

export const useStringSingleSelectComponent = <T>(param: {
  options: readonly PartialStringSelectItem<T>[];
  onSelected?: (selected: StringSelectItemResult<T> | null) => void;
}): UseStringSingleSelectComponentResult<T> => {
  const [result, Select] = useStringSelectComponent({
    options: param.options,
    onSelected: (selected) => {
      param.onSelected?.(singleResult(selected));
    },
  });

  const singleResult = (resultList: StringSelectItemResult<T>[]) => {
    const selected = resultList.filter((item) => item.selected);
    assert(selected.length <= 1);
    return selected[0] ?? null;
  };

  return [
    singleResult(result),
    Select({
      maxValues: 1,
    }),
  ];
};
