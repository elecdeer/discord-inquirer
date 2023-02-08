import assert from "node:assert";

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

export type SelectItem<T> = Omit<AdaptorSelectOption<T>, "value"> & {
  payload: T;
  key: string;
  inactive: boolean;
};

export type PartialSelectItem<T> = SetOptional<
  SelectItem<T>,
  "key" | "inactive"
>;

export type SelectItemResult<T> = SelectItem<T> & {
  selected: boolean;
};

export type UseSelectComponentResult<T> = [
  selectResult: SelectItemResult<T>[],
  StringSelect: StringSelectComponentBuilder<{
    customId: string;
    options: AdaptorSelectOption<T>[];
    minValues: number | undefined;
    maxValues: number | undefined;
  }>,
  stateAccessor: UseSelectResult
];

export type UseSingleSelectComponentResult<T> = [
  selectResult: SelectItemResult<T> | null,
  StringSelect: StringSelectComponentBuilder<{
    customId: string;
    options: AdaptorSelectOption<T>[];
    minValues: number | undefined;
    maxValues: 1;
  }>,
  stateAccessor: UseSelectResult
];

export type UseSelectComponentParams<T> = {
  options: readonly PartialSelectItem<T>[];
  onSelected?: (selected: SelectItemResult<T>[]) => void;
  minValues?: number;
  maxValues?: number;
};

/**
 * StringSelectコンポーネントと選択状態を提供するrenderHook
 * @param options 選択肢 payloadにはstringだけでなく任意のオブジェクトを指定でき、結果として受け取ることができる
 * @param onSelected 選択状態が変更されたときに呼び出される
 * @param maxValues 選択可能なオプションの最大数 (デフォルト: 制限無し)
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 * @returns [selectResult, StringSelect, stateAccessor]
 */
export const useSelectComponent = <T>({
  options,
  onSelected,
  maxValues,
  minValues,
}: UseSelectComponentParams<T>): UseSelectComponentResult<T> => {
  const customId = useCustomId("stringSelect");

  const completedOptions = completePartialOptions(options);

  const stateAccessor = useSelectState({
    customId,
    options: completedOptions,
    selectedUpdateHook: (key, prev, next) => {
      if (prev === next) return false;
      markUpdate();
      return true;
    },
  });

  const optionsWithSelected = completedOptions.map((item) => ({
    ...item,
    selected: stateAccessor.get(item.key),
  }));

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

export type UseSelectStateParam = {
  customId: string;
  options: readonly {
    key: string;
    default?: boolean;
  }[];
  selectedUpdateHook?: (
    key: string,
    prev: boolean,
    next: boolean,
    selectedKeys: readonly string[]
  ) => boolean;
};

export type UseSelectResult = UseSelectResultStateAccessor;

export type UseSelectResultStateAccessor = {
  get: (key: string) => boolean;
  set: (key: string, updater: Lazy<boolean, boolean>) => void;
  setEach: (updater: (prev: boolean, key: string) => boolean) => void;
};

export const useSelectState = ({
  customId,
  options,
  selectedUpdateHook,
}: UseSelectStateParam): UseSelectResult => {
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

  return accessor;
};

const completePartialOptions = <T>(
  items: readonly PartialSelectItem<T>[]
): SelectItemResult<T>[] => {
  return items.map((item, index) => {
    return {
      ...item,
      key: item.key ?? `select-item-${index}`,
      selected: item.default ?? false,
      inactive: item.inactive ?? false,
    };
  });
};

export type UseSingleSelectComponentParam<T> = Omit<
  UseSelectComponentParams<T>,
  "onSelected" | "maxValues"
> & {
  onSelected?: (selected: SelectItemResult<T> | null) => void;
};

/**
 * StringSelectコンポーネントと選択状態を提供するrenderHook
 * useSelectComponentの単一選択版
 * @param options 選択肢 payloadにはstringだけでなく任意のオブジェクトを指定でき、結果として受け取ることができる
 * @param onSelected 選択状態が変更されたときに呼び出される
 * @param minValues 選択可能なオプションの最小数 (デフォルト: 0)
 * @returns [selectResult, StringSelect, stateAccessor]
 */
export const useSingleSelectComponent = <T>({
  options,
  onSelected,
  minValues,
}: UseSingleSelectComponentParam<T>): UseSingleSelectComponentResult<T> => {
  const [result, Select, stateAccessor] = useSelectComponent({
    options: options,
    onSelected: (selected) => {
      onSelected?.(singleResult(selected));
    },
    minValues: minValues,
    maxValues: 1,
  });

  const singleResult = (resultList: SelectItemResult<T>[]) => {
    const selected = resultList.filter((item) => item.selected);
    assert(selected.length <= 1);
    return selected[0] ?? null;
  };

  return [singleResult(result), Select, stateAccessor];
};
