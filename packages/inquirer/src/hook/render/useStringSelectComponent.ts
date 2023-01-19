import assert from "node:assert";

import { StringSelect } from "../../adaptor";
import { useObserveValue } from "../effect/useObserveValue";
import { useStringSelectEvent } from "../effect/useStringSelectEvent";
import { useCollection } from "../state/useCollection";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  AdaptorSelectOption,
  StringSelectComponentBuilder,
} from "../../adaptor";
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
  StringSelect: StringSelectComponentBuilder<{
    customId: string;
    options: AdaptorSelectOption<T>[];
    minValues: number | undefined;
    maxValues: number | undefined;
  }>
];

export type UseStringSingleSelectComponentResult<T> = [
  selectResult: StringSelectItemResult<T> | null,
  StringSelect: StringSelectComponentBuilder<{
    customId: string;
    options: AdaptorSelectOption<T>[];
    minValues: number | undefined;
    maxValues: 1;
  }>
];

export type UseStringSelectComponentParams<T> = {
  options: readonly PartialStringSelectItem<T>[];
  onSelected?: (selected: StringSelectItemResult<T>[]) => void;
  minValues?: number;
  maxValues?: number;
  onMaxExceeded?: "keep" | "override" | "reject";
};
export const useStringSelectComponent = <T>(
  param: UseStringSelectComponentParams<T>
): UseStringSelectComponentResult<T> => {
  const { onMaxExceeded = "override" } = param;

  const customId = useCustomId("stringSelect");

  const items = initialSelectItems(param.options);

  const [_, dispatch] = useState(0);

  const { setEach, get, values } = useCollection(
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

  useStringSelectEvent(customId, async (_, selectedKeys, deferUpdate) => {
    const inactivePageSelectedKeys = items
      .filter((item) => item.inactive === true && get(item.key)?.selected)
      .map((item) => item.key);
    let allSelectedKeys = [...inactivePageSelectedKeys, ...selectedKeys];

    //TODO これselectedのやつは常にactiveにするのが正解じゃないか？

    console.log(inactivePageSelectedKeys);
    console.log(selectedKeys);
    if (
      param.maxValues !== undefined &&
      allSelectedKeys.length > param.maxValues
    ) {
      if (onMaxExceeded === "reject") {
        //deferUpdateしない
        return;
      } else if (onMaxExceeded === "keep") {
        //既存のを優先
        allSelectedKeys = [...inactivePageSelectedKeys, ...selectedKeys].slice(
          0,
          param.maxValues
        );
        console.log("keep", allSelectedKeys);
      } else if (onMaxExceeded === "override") {
        //新しいのを優先
        allSelectedKeys = [...selectedKeys, ...inactivePageSelectedKeys].slice(
          0,
          param.maxValues
        );
        console.log("override", allSelectedKeys);
      }
      dispatch((n) => n + 1);
    }
    await deferUpdate();

    setEach((prev, key) => {
      const selected = allSelectedKeys.includes(key);
      if (prev.selected === selected) {
        return prev;
      } else {
        markChanged();
        return {
          ...prev,
          selected,
        };
      }
    });
    console.log(allSelectedKeys);
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
    minValues: param.minValues,
    maxValues: param.maxValues,
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

export const useStringSingleSelectComponent = <T>(
  param: Omit<UseStringSelectComponentParams<T>, "onSelected" | "maxValues"> & {
    onSelected?: (selected: StringSelectItemResult<T> | null) => void;
  }
): UseStringSingleSelectComponentResult<T> => {
  const [result, Select] = useStringSelectComponent({
    options: param.options,
    onSelected: (selected) => {
      param.onSelected?.(singleResult(selected));
    },
    minValues: param.minValues,
    maxValues: 1,
  });

  const singleResult = (resultList: StringSelectItemResult<T>[]) => {
    const selected = resultList.filter((item) => item.selected);
    assert(selected.length <= 1);
    return selected[0] ?? null;
  };

  return [singleResult(result), Select];
};
