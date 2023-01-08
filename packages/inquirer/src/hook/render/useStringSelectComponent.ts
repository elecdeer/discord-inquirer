import { StringSelect } from "../../adaptor";
import { useEffect } from "../effect/useEffect";
import { useStringSelectEvent } from "../effect/useStringSelectEvent";
import { useCollection } from "../state/useCollection";
import { useCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";

import type {
  AdaptorStringSelectComponent,
  AdaptorSelectOption,
} from "../../adaptor";
import type { UnfulfilledCurriedBuilder } from "../../util/curriedBuilder";
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
  Select: UnfulfilledCurriedBuilder<
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
  const customId = useCustomId("select");

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
  const valueChanged = useRef(false);

  useStringSelectEvent(customId, async (interaction, values, deferUpdate) => {
    await deferUpdate();

    setEach((prev, key) => {
      const selected = values.includes(key);
      if (prev.selected == selected) {
        return prev;
      } else {
        valueChanged.current = true;
        return {
          ...prev,
          selected,
        };
      }
    });
  });

  //あまり良い実装では無い
  useEffect(() => {
    if (valueChanged.current) {
      param.onSelected?.(result());
      valueChanged.current = false;
    }
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

  const result = () =>
    items.map((item) => ({
      ...item,
      selected: get(item.key)?.selected ?? false,
    }));

  return [result(), renderComponent];
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
