import { useSelectState } from "./useSelectComponent";
import { StringSelect } from "../../adaptor";
import { resolveLazy } from "../../util/lazy";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  PartialSelectItem,
  SelectItem,
  SelectItemResult,
  UseSelectResult,
} from "./useSelectComponent";
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

/**
 * @param result 選択状態が追加されたSelectItemの配列
 * @param Select Selectコンポーネントのビルダー
 * @param page 現在のページ
 * @param pageNum 全ページ数
 * @param setPage ページを変更する関数
 * @param stateAccessor 選択状態を外部から操作するための関数群
 */
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

/**
 * ページ分割されたSelectコンポーネントと選択状態を提供するRenderHook
 * @param optionsResolver ページ分割されたオプションを返す関数
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param maxValues 選択可能なオプションの最大数 ページごとではなく全てのページを合わせた選択数 showSelectedAlwaysがtrueの場合、1~24の値を指定する必要がある (デフォルト: 制限無し)
 * @param minValues 選択可能なオプションの最小数 ページごとではなく全てのページの合わせた選択数 (デフォルト: 0)
 * @param showSelectedAlways 選択済みのオプションを常に表示するかどうか trueの場合、maxValuesの値だけ1ページごとに表示されるオプションの数が減る
 * @param pageTorus ページの最大値を超えた場合に最小値に戻るかどうか (デフォルト: false)
 * @returns { result, Select, page, pageNum, setPage, stateAccessor}
 */
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

  const pageOnSelected = (result: SelectItemResult<T>[]) => {
    //minValuesとmaxValuesを満たしていない場合はイベントを発火しない
    const selectedItemNum = result.filter((item) => item.selected).length;
    if (minValues !== undefined && selectedItemNum < minValues) return;
    if (maxValues !== undefined && maxValues < selectedItemNum) return;
    onSelected?.(result);
  };

  const customId = useCustomId("stringSelect");
  const [optionsWithSelected, stateAccessor] = useSelectState({
    customId,
    options: allOptions,
    selectedUpdateHook: (key, prev, next, selectedKeys) => {
      console.log("selectedUpdateHook", key, prev, next, selectedKeys);
      //他ページでの選択数 + 今回の選択数がmaxValuesを超える場合は無視
      if (maxValues !== undefined) {
        if (showSelectedAlways && selectedKeys.length > maxValues) return false;
        if (
          !showSelectedAlways &&
          inactiveSelectedOptions.length + selectedKeys.length > maxValues
        )
          return false;
      }

      //表示されていないなら無視
      if (!showOptions.some((option) => option.key === key)) return false;
      if (prev === next) return false;
      console.log("update");

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

/**
 * オプションをページごとに分割する関数
 * 1ページごとのオプション数が多くなるように前詰めで分割する
 * @param option
 */
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

/**
 * オプションをページごとに分割する関数
 * 1ページごとのオプション数が均等になるように分割する
 * @param options
 */
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
