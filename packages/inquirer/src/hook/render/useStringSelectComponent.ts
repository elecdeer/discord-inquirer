import { StringSelect } from "../../adaptor";
import { useEffect } from "../effect/useEffect";
import { useObserveValue } from "../effect/useObserveValue";
import { useStringSelectEvent } from "../effect/useStringSelectEvent";
import { useCollection } from "../state/useCollection";
import { useCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";

import type {
  AdaptorSelectOption,
  StringSelectComponentBuilder,
} from "../../adaptor";
import type { SetOptional } from "type-fest";

export type StringSelectItem<T> = Omit<AdaptorSelectOption<T>, "value"> & {
  payload: T;
  key: string;
  inactive: boolean;
};

export type PartialStringSelectItem<T> = SetOptional<
  StringSelectItem<T>,
  "key" | "inactive"
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
};

export const useStringSelectComponent = <T>({
  options,
  onSelected,
  maxValues,
  minValues,
}: UseStringSelectComponentParams<T>): UseStringSelectComponentResult<T> => {
  const customId = useCustomId("stringSelect");

  const completedOptions = completeOptions(options);
  console.log("completedOptions", completedOptions);

  const [optionsWithSelected, getSelectedState] = useSelectState({
    customId,
    options: completedOptions,
    selectedUpdateHook: (key, prev, next) => {
      if (prev === next) return false;
      markUpdate();
      return true;
    },
  });

  const markUpdate = useObserveValue(optionsWithSelected, onSelected);

  const activeOptions = optionsWithSelected.filter((item) => !item.inactive);
  const pageOptions = activeOptions.map(
    (item) =>
      ({
        value: item.key,
        label: item.label,
        default: getSelectedState(item.key),
        description: item.description,
        emoji: item.emoji,
      } satisfies AdaptorSelectOption<unknown>)
  );

  const renderComponent = StringSelect({
    customId,
    options: pageOptions,
    minValues: minValues,
    maxValues: maxValues,
  });

  return [optionsWithSelected, renderComponent];
};

export const useSelectState = <T extends StringSelectItem<unknown>>({
  customId,
  options,
  selectedUpdateHook,
}: {
  customId: string;
  options: readonly T[];
  selectedUpdateHook?: (
    key: string,
    prev: boolean,
    next: boolean,
    selectedKeys: string[]
  ) => boolean;
}): [
  optionsWithSelected: (T & {
    selected: boolean;
  })[],
  getSelectedState: (key: string) => boolean
] => {
  //optionsが変わったら、collectionをリセットする
  const { setEach, get, reset, map } = useCollection<string, boolean>(
    options.map((item) => [item.key, item.default ?? false])
  );

  const ref = useRef(options);
  const willReset = useRef(false);
  if (ref.current !== options) {
    console.log("will reset", ref.current, options);
    willReset.current = true;
    ref.current = options;
  }

  useEffect(() => {
    console.log("useEffect", willReset.current);
    if (willReset.current) {
      reset();
      console.log("reset");
      willReset.current = false;
    }
  });

  console.log("map", map());

  const getSelectedState = (key: string) => get(key) ?? false;

  const optionsWithSelected = options.map((option) => ({
    ...option,
    selected: getSelectedState(option.key),
  }));

  useStringSelectEvent(customId, async (_, selectedKeys, deferUpdate) => {
    //選択状態が何も変化しないinteractionはそもそもAPIから送られないことを前提としている
    let updated = false;

    setEach((prev, key) => {
      const selected = selectedKeys.includes(key);
      const shouldUpdate =
        selectedUpdateHook ?? ((_, _prev, _next) => _prev !== _next);
      if (shouldUpdate(key, prev, selected, selectedKeys)) {
        updated = true;
        return selected;
      } else {
        return prev;
      }
    });

    if (updated) {
      await deferUpdate();
    }
  });

  return [optionsWithSelected, getSelectedState];
};

const completeOptions = <T>(
  items: readonly PartialStringSelectItem<T>[]
): StringSelectItemResult<T>[] => {
  return items.map((item, index) => {
    return {
      ...item,
      key: item.key ?? `select-item-${index}`,
      selected: item.default ?? false,
      inactive: item.inactive ?? false,
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
