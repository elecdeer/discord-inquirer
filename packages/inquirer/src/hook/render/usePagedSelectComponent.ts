import { useSelectState } from "./useSelectComponent";
import { StringSelect } from "../../adaptor";
import { resolveLazy } from "../../util/lazy";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  PartialSelectItem,
  SelectItemResult,
  UseSelectResultStateAccessor,
} from "./useSelectComponent";
import type {
  AdaptorSelectOption,
  StringSelectComponentBuilder,
  AdaptorStringSelectInteraction,
} from "../../adaptor";
import type { Lazy } from "../../util/lazy";

export type UsePagedSelectComponentParams<T> = {
  optionsResolver: (maxItemNumPerPage: number) => PartialSelectItem<T>[][];
  onSelected?: (selected: SelectItemResult<T>[]) => void;
  pageTorus?: boolean;
  minValues?: number;
  filter?: (interaction: Readonly<AdaptorStringSelectInteraction>) => boolean;
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

  stateAccessor: UseSelectResultStateAccessor;
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
 * @param filter interactionに反応するかどうかのフィルタ falseを返すとdeferUpdateとonSelectedは実行されない
 * @returns { result, Select, page, pageNum, setPage, stateAccessor}
 */
export const usePagedSelectComponent = <T>({
  optionsResolver,
  onSelected,
  maxValues,
  minValues,
  showSelectedAlways,
  pageTorus = false,
  filter = (_) => true,
}: UsePagedSelectComponentParams<T>): UsePagedSelectComponentResult<T> => {
  //showSelectedAlwaysの場合は選択されうるオプションの数だけ、表示できる枠が減る
  const maxOptionNumPerPage =
    showSelectedAlways === true
      ? maximumOptionNum - maxValues
      : maximumOptionNum;

  const splitOptions = optionsResolver(maxOptionNumPerPage);
  const pageNum = splitOptions.length;

  const customId = useCustomId("stringSelect");

  const [page, setPage] = useRangedNumberState({
    initial: 0,
    min: 0,
    max: pageNum - 1,
    torus: pageTorus,
  });

  const allOptions = flatAndCompleteOptions(splitOptions);

  const stateAccessor = useSelectState({
    customId,
    options: allOptions,
    selectedUpdateHook: (key, prev, next, selectedKeys) => {
      //他ページでの選択数 + 今回の選択数がmaxValuesを超える場合は無視
      if (
        maxValues !== undefined &&
        hideSelectedOptions.length + selectedKeys.length > maxValues
      ) {
        return false;
      }

      //表示されていないなら無視
      if (!showOptions.some((option) => option.key === key)) return false;
      if (prev === next) return false;

      markUpdate();
      return true;
    },
    filter,
  });

  const allOptionsWithState = allOptions.map((option) => {
    const isCurrentPage = option.page === page;
    const selected = stateAccessor.get(option.key);
    return {
      ...option,
      selected: selected,
      inactive: !(isCurrentPage || (showSelectedAlways && selected)),
    };
  });

  const pageOnSelected = (result: SelectItemResult<T>[]) => {
    //minValuesとmaxValuesを満たしていない場合はイベントを発火しない
    const selectedItemNum = result.filter((item) => item.selected).length;
    if (minValues !== undefined && selectedItemNum < minValues) return;
    if (maxValues !== undefined && maxValues < selectedItemNum) return;
    onSelected?.(result);
  };

  const markUpdate = useObserveValue(allOptionsWithState, pageOnSelected);

  const hideOptions = allOptionsWithState.filter((option) => option.inactive);
  const hideSelectedOptions = hideOptions.filter((option) => option.selected);

  const showOptions = allOptionsWithState.filter((option) => !option.inactive);

  //他ページの選択済みのオプションを先頭に持ってくる
  const sortedShowOptions = [
    ...showOptions.filter((option) => option.page !== page),
    ...showOptions.filter((option) => option.page === page),
  ];

  const pageMinValues = 0;

  //非表示の選択済みのオプションの数を引く
  //0を指定することはできず、表示オプション数を超えてはいけない
  const pageMaxValues = () => {
    if (maxValues === undefined) return maxValues;

    const restSelectableNum = maxValues - hideSelectedOptions.length;

    if (restSelectableNum < 1) return 1;
    if (showOptions.length < restSelectableNum) return showOptions.length;
    return restSelectableNum;
  };

  return {
    page: page,
    pageNum: pageNum,
    setPage: setPage,
    stateAccessor: stateAccessor,
    Select: StringSelect({
      customId: customId,
      options: sortedShowOptions.map(
        (opt) =>
          ({
            value: opt.key,
            label: opt.label,
            default: opt.selected,
            description: opt.description,
            emoji: opt.emoji,
          } satisfies AdaptorSelectOption<unknown>)
      ),
      minValues: pageMinValues,
      maxValues: pageMaxValues(),
    }),
    result: allOptionsWithState,
  };
};

const flatAndCompleteOptions = <T>(splitOptions: PartialSelectItem<T>[][]) => {
  const options: (Omit<SelectItemResult<T>, "inactive" | "selected"> & {
    page: number;
  })[] = [];
  splitOptions.forEach((pageOptions, pageIndex) => {
    pageOptions.forEach((option) => {
      const allIndex = options.length;
      options.push({
        ...option,
        key: option.key ?? `paged-select-item-${allIndex}`,
        page: pageIndex,
      });
    });
  });

  return options;
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
  (maxOptionNumPerPage: number): T[][] => {
    const result: T[][] = [];
    const pageNum = Math.ceil(option.length / maxOptionNumPerPage);
    for (let i = 0; i < pageNum; i++) {
      result.push(
        option.slice(i * maxOptionNumPerPage, (i + 1) * maxOptionNumPerPage)
      );
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
  (maxOptionNumPerPage: number): T[][] => {
    const result: T[][] = [];
    const pageNum = Math.ceil(options.length / maxOptionNumPerPage);
    let splitIndex = 0;
    for (let i = 0; i < pageNum; i++) {
      //残りのアイテム数 / 残りのページ数
      const num = Math.ceil((options.length - splitIndex) / (pageNum - i));
      result.push(options.slice(splitIndex, splitIndex + num));
      splitIndex += num;
    }
    return result;
  };
