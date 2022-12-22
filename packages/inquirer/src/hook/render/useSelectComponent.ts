import { Select } from "../../component";
import { useEffect } from "../effect/useEffect";
import { useSelectMenuEvent } from "../effect/useSelectMenuEvent";
import { useCollection } from "../state/useCollection";
import { useCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";

import type { StringSelectComponent, SelectOption } from "../../adaptor";
import type { SelectOptionProps, SelectDisplayProps } from "../../component";
import type { SetOptional } from "type-fest";

export type SelectItem<T> = Omit<SelectOption<T>, "value"> & {
  key: string;
  payload: T;
  inactive?: boolean;
};

export type PartialSelectItem<T> = SetOptional<SelectItem<T>, "key">;

export type SelectItemResult<T> = SelectItem<T> & {
  selected: boolean;
};

export type UseSelectComponentResult<T> = [
  selectResult: SelectItemResult<T>[],
  Select: (props: SelectDisplayProps) => StringSelectComponent<T>
];

export const useSelectComponent = <T>(
  param: Omit<SelectOptionProps, "options"> & {
    options: readonly PartialSelectItem<T>[];
    onSelected?: (selected: SelectItemResult<T>[]) => void;
  }
): UseSelectComponentResult<T> => {
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

  useSelectMenuEvent(customId, async (interaction, values, deferUpdate) => {
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

  const renderComponent = Select(customId, {
    ...param,
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
  items: readonly PartialSelectItem<T>[]
): SelectItemResult<T>[] => {
  return items.map((item, index) => {
    return {
      ...item,
      selected: item.default ?? false,
      key: item.key ?? `select-item-${index}`,
    };
  });
};
