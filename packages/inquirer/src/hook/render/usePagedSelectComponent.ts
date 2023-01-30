import { useSelectState } from "./useSelectComponent";
import { StringSelect } from "../../adaptor";
import { resolveLazy } from "../../util/lazy";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  SelectItemResult,
  SelectItem,
  UseSelectResult,
} from "./useSelectComponent";
import type { PartialSelectItem } from "./useSelectComponent";
import type {
  AdaptorSelectOption,
  StringSelectComponentBuilder,
} from "../../adaptor";
import type { Lazy } from "../../util/lazy";

export type UsePagedSelectComponentParams<T> = {
  optionsResolver: (maxItemNumPerPage: number) => PartialSelectItem<T>[][];
  onSelected?: (selected: SelectItemResult<T>[]) => void;
  pageTorus?: boolean;
  minValues?: number;
} & (
  | {
      showSelectedAlways?: false;
      maxValues?: number;
    }
  | {
      showSelectedAlways: true;
      maxValues: number;
    }
);

export type UsePagedSelectComponentResult<T> = {
  result: (SelectItemResult<T> & { page: number })[];
  Select: StringSelectComponentBuilder<{
    customId: string;
    options: AdaptorSelectOption<T>[];
    minValues: 0;
    maxValues: number | undefined;
  }>;
  page: number;
  pageNum: number;
  setPage: (dispatch: Lazy<number, number>) => void;

  stateAccessor: UseSelectResult<SelectItem<T>>[1];
};

//DiscordAPIの制限
const maximumOptionNum = 25;

export const usePagedSelectComponent = <T>({
  optionsResolver,
  onSelected,
  maxValues,
  minValues,
  showSelectedAlways,
  pageTorus = false,
}: UsePagedSelectComponentParams<T>): UsePagedSelectComponentResult<T> => {
  const splitOptions = optionsResolver(
    showSelectedAlways === true
      ? maximumOptionNum - maxValues
      : maximumOptionNum
  );
  const pageNum = splitOptions.length;

  const [page, setPage] = useRangedNumberState({
    initial: 0,
    min: 0,
    max: pageNum - 1,
    torus: pageTorus,
  });

  const resolveOptions = () => {
    const splitOptions = optionsResolver(
      showSelectedAlways === true
        ? maximumOptionNum - maxValues
        : maximumOptionNum
    );
    const options: (SelectItemResult<T> & {
      page: number;
    })[] = [];
    splitOptions.forEach((pageOptions, pageIndex) => {
      pageOptions.forEach((option) => {
        const index = options.length;
        const key = option.key ?? `paged-select-item-${index}`;
        const active = page === pageIndex;
        options.push({
          ...option,
          key: key,
          inactive: !active,
          selected: option.default ?? false,
          page: pageIndex,
        });
      });
    });

    //showSelectedAlwaysがtrueの場合、selectedならinactiveを強制的にfalseにする
    return options;
  };
  const allOptions = resolveOptions();
  console.log("allOptions", allOptions);

  const pageOnSelected = (result: SelectItemResult<T>[]) => {
    //minValuesとmaxValuesを満たしていない場合はイベントを発火しない
    const selectedItems = result.filter((item) => item.selected);
    if (minValues !== undefined && selectedItems.length < minValues) return;
    if (maxValues !== undefined && maxValues < selectedItems.length) return;
    onSelected?.(result);
  };

  const customId = useCustomId("stringSelect");
  const [optionsWithSelected, stateAccessor] = useSelectState({
    customId,
    options: allOptions,
    selectedUpdateHook: (key, prev, next, selectedKeys) => {
      //他ページでの選択数 + 今回の選択数がmaxValuesを超える場合は無視
      if (
        maxValues !== undefined &&
        inactiveSelectedOptions.length + selectedKeys.length > maxValues
      )
        return false;
      //表示されていないなら無視
      if (!showOptions.some((option) => option.key === key)) return false;
      if (prev === next) return false;
      markUpdate();
      return true;
    },
  });
  const markUpdate = useObserveValue(optionsWithSelected, pageOnSelected);

  const selectedOptions = optionsWithSelected.filter((item) => item.selected);
  const inactiveSelectedOptions = selectedOptions.filter(
    (item) => item.inactive
  );
  const activeOptions = optionsWithSelected.filter((item) => !item.inactive);

  const showOptions = [
    ...(showSelectedAlways === true ? inactiveSelectedOptions : []),
    ...activeOptions,
  ];
  const pageOptions = showOptions.map(
    (item) =>
      ({
        value: item.key,
        label: item.label,
        default: stateAccessor.get(item.key),
        description: item.description,
        emoji: item.emoji,
      } satisfies AdaptorSelectOption<unknown>)
  );

  const pageMinValues = 0;

  //showSelectedAlwaysがtrueのときは選択済みが全て表示されるのでそのまま
  //falseのときは選択済みは表示されないので、別ページで選択済みの数を引く
  //0を指定することはできず、オプション数を超えてはいけない
  const pageMaxValues =
    showSelectedAlways === true || maxValues === undefined
      ? maxValues
      : Math.max(
          1,
          Math.min(
            maxValues - inactiveSelectedOptions.length,
            pageOptions.length
          )
        );

  return {
    result: optionsWithSelected,
    page: page,
    pageNum: pageNum,
    setPage: setPage,
    Select: StringSelect({
      customId: customId,
      options: pageOptions,
      minValues: pageMinValues,
      maxValues: pageMaxValues ?? pageOptions.length,
    }),
    stateAccessor: stateAccessor,
  };
};

export const useRangedNumberState = ({
  initial,
  min,
  max,
  torus,
}: {
  initial: Lazy<number>;
  min: number;
  max: number;
  torus: boolean;
}): [number, (dispatch: Lazy<number, number>) => void] => {
  const clamp = (next: number) => {
    if (torus) {
      while (next < min) next += max - min + 1;
      return (next % (max - min + 1)) + min;
    } else {
      if (next < min) return min;
      if (next >= max) return max;
      return next;
    }
  };

  const [value, _setValue] = useState(() => clamp(resolveLazy(initial)));

  const setValue = (page: Lazy<number, number>) => {
    _setValue((prev) => clamp(resolveLazy(page, prev)));
  };

  return [value, setValue];
};

export const closeSplitter =
  <T>(option: readonly T[]) =>
  (numPerPage: number): T[][] => {
    const result: T[][] = [];
    const pageNum = Math.ceil(option.length / numPerPage);
    for (let i = 0; i < pageNum; i++) {
      result.push(option.slice(i * numPerPage, (i + 1) * numPerPage));
    }
    return result;
  };

export const equalitySplitter =
  <T>(options: readonly T[]) =>
  (numPerPage: number): T[][] => {
    const result: T[][] = [];
    const pageNum = Math.ceil(options.length / numPerPage);
    let splitIndex = 0;
    for (let i = 0; i < pageNum; i++) {
      //残りのアイテム数 / 残りのページ数
      const num = Math.ceil((options.length - splitIndex) / (pageNum - i));
      result.push(options.slice(splitIndex, splitIndex + num));
      splitIndex += num;
    }
    return result;
  };
