import { StringSelect } from "../../adaptor";
import { useObserveValue } from "../effect/useObserveValue";
import { useStringSelectEvent } from "../effect/useStringSelectEvent";
import { useCollection } from "../state/useCollection";
import { useCustomId } from "../state/useCustomId";

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
  /**
   * 選択可能な最小数
   * ただし、inactiveであるオプションが存在する場合は、0個選択が許容される
   * @default 0
   */
  minValues?: number;
} & (
  | {
      showSelectedAlways?: false;
      maxValues?: number;
    }
  | {
      /**
       * 選択されているオプションをinactiveであっても常に表示するかどうか
       * trueの場合、maxValuesは20以下のnumberである必要がある
       */
      showSelectedAlways: true;

      /**
       * 選択可能な最大数
       * showSelectedAlwaysがtrueの場合、maxValuesは20以下のnumberである必要がある
       */
      maxValues: number;
    }
);

export const useStringSelectComponent = <T>({
  options,
  onSelected,
  maxValues,
  minValues,
  showSelectedAlways = true,
}: UseStringSelectComponentParams<T>): UseStringSelectComponentResult<T> => {
  const customId = useCustomId("stringSelect");

  const items = initialSelectItems(options);

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

  const markChanged = useObserveValue(result, onSelected);

  useStringSelectEvent(customId, async (_, selectedKeys, deferUpdate) => {
    if (pageMaxValue === 0) return; //他のページの選択済みで枠が埋まっている場合はreject

    await deferUpdate();

    const allSelectedKeys = [
      ...(showSelectedAlways
        ? []
        : inactiveSelectedOptions.map((item) => item.key)),
      ...selectedKeys,
    ];

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
  });

  const inactiveOptions = items.filter((item) => item.inactive === true);
  const inactiveSelectedOptions = inactiveOptions.filter(
    (item) => get(item.key)?.selected ?? false
  );
  const activeOptions = items.filter((item) => item.inactive !== true);

  const pageOptions = [
    ...(showSelectedAlways ? inactiveSelectedOptions : []),
    ...activeOptions,
  ].map(
    (item) =>
      ({
        value: item.key,
        label: item.label,
        default: get(item.key)?.selected ?? false,
        description: item.description,
        emoji: item.emoji,
      } satisfies AdaptorSelectOption<unknown>)
  );

  //この辺はuseSelectPagingに移したい気もするが、それには選択状態を渡さないと行けない
  const pageMaxValue =
    showSelectedAlways || maxValues === undefined
      ? maxValues
      : maxValues - inactiveSelectedOptions.length;
  const pageMinValue = inactiveOptions.length > 0 ? 0 : minValues;

  const renderComponent = StringSelect({
    customId,
    options: pageOptions,
    minValues: pageMinValue,
    maxValues:
      pageMaxValue === undefined ? undefined : Math.max(pageMaxValue, 1),
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

// export const useStringSingleSelectComponent = <T>(
//   param: Omit<UseStringSelectComponentParams<T>, "onSelected" | "maxValues"> & {
//     onSelected?: (selected: StringSelectItemResult<T> | null) => void;
//   }
// ): UseStringSingleSelectComponentResult<T> => {
//   // const [result, Select] = useStringSelectComponent({
//   //   options: param.options,
//   //   onSelected: (selected) => {
//   //     param.onSelected?.(singleResult(selected));
//   //   },
//   //   minValues: param.minValues,
//   //   maxValues: 1,
//   // });
//
//   const singleResult = (resultList: StringSelectItemResult<T>[]) => {
//     const selected = resultList.filter((item) => item.selected);
//     assert(selected.length <= 1);
//     return selected[0] ?? null;
//   };
//
//   return [singleResult(result), Select];
// };
