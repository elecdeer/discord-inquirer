import { StringSelect } from "../../adaptor";
import { resolveLazy } from "../../util/lazy";
import { useObserveValue } from "../effect/useObserveValue";
import { useStringSelectEvent } from "../effect/useStringSelectEvent";
import { useCollection } from "../state/useCollection";
import { useCustomId } from "../state/useCustomId";

import type {
  AdaptorSelectOption,
  StringSelectComponentBuilder,
} from "../../adaptor";
import type { Lazy } from "../../util/lazy";
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
  }>,
  stateAccessor: UseSelectResult<StringSelectItem<T>>[1]
];

export type UseStringSingleSelectComponentResult<T> = [
  selectResult: StringSelectItemResult<T> | null,
  StringSelect: StringSelectComponentBuilder<{
    customId: string;
    options: AdaptorSelectOption<T>[];
    minValues: number | undefined;
    maxValues: 1;
  }>,
  stateAccessor: UseSelectResult<StringSelectItem<T>>[1]
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

  const [optionsWithSelected, stateAccessor] = useSelectState({
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
        default: stateAccessor.get(item.key),
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

  return [optionsWithSelected, renderComponent, stateAccessor];
};

export type UseSelectStateParam<T extends StringSelectItem<unknown>> = {
  customId: string;
  options: readonly T[];
  selectedUpdateHook?: (
    key: string,
    prev: boolean,
    next: boolean,
    selectedKeys: string[]
  ) => boolean;
};

export type UseSelectResult<T extends StringSelectItem<unknown>> = [
  optionsWithSelected: (T & {
    selected: boolean;
  })[],
  stateAccessor: {
    get: (key: string) => boolean;
    set: (key: string, updater: Lazy<boolean, boolean>) => void;
    setEach: (updater: (prev: boolean, key: string) => boolean) => void;
  }
];

export const useSelectState = <T extends StringSelectItem<unknown>>({
  customId,
  options,
  selectedUpdateHook,
}: UseSelectStateParam<T>): UseSelectResult<T> => {
  //optionsが変わったら、collectionをリセットする
  const { setEach, get, set } = useCollection<string, boolean>(
    options.map((item) => [item.key, item.default ?? false])
  );

  const accessor = {
    get: (key: string) => get(key) ?? false,
    set: (key: string, updater: Lazy<boolean, boolean>) => {
      set(key, (prev) => resolveLazy(updater, prev ?? false));
    },
    setEach: setEach,
  };

  const optionsWithSelected = options.map((option) => ({
    ...option,
    selected: accessor.get(option.key),
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

  return [optionsWithSelected, accessor];
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
