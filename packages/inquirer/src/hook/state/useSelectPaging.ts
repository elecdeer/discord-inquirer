import { useState } from "./useState";
import { resolveLazy } from "../../util/lazy";

import type { Lazy } from "../../util/lazy";
import type {
  PartialStringSelectItem,
  StringSelectItemResult,
  UseStringSelectComponentParams,
} from "../render/useStringSelectComponent";
import type { Except, Simplify } from "type-fest";

export type UseSelectPagingResult<T> = {
  selectParams: UseStringSelectComponentParams<T>;
  setPage: (page: Lazy<number, number>) => void;
  page: number;
};

export type UseSelectPagingParams<T> = {
  pageOptions: (maxItemNumPerPage: number) => PartialStringSelectItem<T>[][];
  pageTorus?: boolean;
} & Except<UseStringSelectComponentParams<T>, "options">;

export const useSelectPaging = <T>(
  param: Simplify<UseSelectPagingParams<T>>
): UseSelectPagingResult<T> => {
  const {
    pageOptions,
    pageTorus = true,
    onSelected,
    minValues,
    maxValues,
    showSelectedAlways,
  } = param;

  //showSelectedAlwaysがtrueの場合、maxValuesは20以下で!== undefinedである必要がある
  //既に選択されているオプションの枠を確保する必要があるため
  if (param.showSelectedAlways === true && param.maxValues > 20) {
    throw new Error(
      "[useSelectPaging] maxValues must be less than 20 when showSelectedAlways is true"
    );
  }

  const [page, _setPage] = useState(0);
  const setPage = (page: Lazy<number, number>) => {
    _setPage((prev) => {
      let next = resolveLazy(page, prev);
      if (pageTorus) {
        while (next < 0) next += splitOptions.length;
        return next % splitOptions.length;
      } else {
        if (next < 0) return 0;
        if (next >= splitOptions.length) return splitOptions.length - 1;
        return next;
      }
    });
  };

  console.log("page", page);

  const splitOptions = pageOptions(
    showSelectedAlways === true ? 25 - maxValues : 25
  );

  const options = splitOptions.reduce((acc, cur, i) => {
    return [...acc, ...cur.map((item) => ({ ...item, inactive: i !== page }))];
  }, []);

  console.log(options);

  const pageOnSelected = (result: StringSelectItemResult<T>[]) => {
    const selectedItems = result.filter((item) => item.selected);
    if (minValues !== undefined && selectedItems.length < minValues) return;
    if (maxValues !== undefined && maxValues < selectedItems.length) return;
    onSelected?.(result);
  };

  if (showSelectedAlways === true) {
    return {
      selectParams: {
        options,
        onSelected: pageOnSelected,
        showSelectedAlways: showSelectedAlways,
        maxValues: maxValues,
        minValues: minValues,
      },
      setPage: setPage,
      page: page,
    };
  } else {
    return {
      selectParams: {
        options,
        onSelected: pageOnSelected,
        showSelectedAlways: showSelectedAlways,
        maxValues: maxValues,
        minValues: minValues,
      },
      setPage: setPage,
      page: page,
    };
  }
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
