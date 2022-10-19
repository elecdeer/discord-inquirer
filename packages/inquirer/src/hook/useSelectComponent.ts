import { renderSelectComponent } from "../component";
import { useCustomId } from "./useCustomId";
import { useMap } from "./useMap";
import { useSelectMenuEvent } from "./useSelectMenuEvent";

import type { SelectMenuComponent, SelectOption } from "../adaptor";
import type { SelectOptionProps, SelectDisplayProps } from "../component";
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
  SelectItemResult<T>[],
  (props: SelectDisplayProps) => SelectMenuComponent<T>
];

export const useSelectComponent = <T>(
  param: Omit<SelectOptionProps, "options"> & {
    options: readonly PartialSelectItem<T>[];
  }
): UseSelectComponentResult<T> => {
  const customId = useCustomId("select");

  const items = supplementItemKey(param.options);

  const { setAll, get } = useMap(
    items.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = item.default ?? false;
      return acc;
    }, {})
  );

  useSelectMenuEvent(customId, async (interaction, values, deferUpdate) => {
    await deferUpdate();

    const next = items.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.key] = values.includes(item.key);
      return acc;
    }, {});

    setAll(next);
  });

  const renderComponent = renderSelectComponent(customId, {
    ...param,
    options: items
      .map((item) => ({
        ...item,
        value: item.key,
        default: get(item.key) ?? false,
      }))
      .filter((item) => !(item.inactive ?? false)),
  });

  const getResult = (): SelectItemResult<T>[] => {
    return items.map((item) => ({
      ...item,
      selected: get(item.key) ?? false,
    }));
  };

  return [getResult(), renderComponent];
};

const supplementItemKey = <T>(
  items: readonly PartialSelectItem<T>[]
): SelectItem<T>[] => {
  return items.map((item, index) => {
    return {
      ...item,
      key: item.key ?? `select-item-${index}`,
    };
  });
};
