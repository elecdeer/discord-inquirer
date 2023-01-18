import { useState } from "./useState";
import { resolveLazy } from "../../util/lazy";

import type { Lazy } from "../../util/lazy";
import type { PartialStringSelectItem } from "../render/useStringSelectComponent";

export type UseSelectPagingResult<T> = {
  options: PartialStringSelectItem<T>[];
  setPage: (page: Lazy<number, number>) => void;
  page: number;
};

export const useSelectPaging = <T>({
  pageOptions,
  pageTorus = true,
}: {
  pageOptions: readonly PartialStringSelectItem<T>[][];
  pageTorus?: boolean;
}): UseSelectPagingResult<T> => {
  const [page, _setPage] = useState(0);
  const setPage = (page: Lazy<number, number>) => {
    _setPage((prev) => {
      let next = resolveLazy(page, prev);
      if (pageTorus) {
        while (next < 0) next += pageOptions.length;
        return next % pageOptions.length;
      } else {
        if (next < 0) return 0;
        if (next >= pageOptions.length) return pageOptions.length - 1;
        return next;
      }
    });
  };

  const options = pageOptions.reduce((acc, cur, i) => {
    return [...acc, ...cur.map((item) => ({ ...item, inactive: i !== page }))];
  }, []);

  return {
    options: options,
    setPage: setPage,
    page: page,
  };
};

export const splitClose = <T>(option: readonly T[]): T[][] => {
  const result: T[][] = [];
  const pageNum = Math.ceil(option.length / 25);
  for (let i = 0; i < pageNum; i++) {
    result.push(option.slice(i * 25, (i + 1) * 25));
  }
  return result;
};

export const splitEquality = <T>(options: readonly T[]): T[][] => {
  const result: T[][] = [];
  const pageNum = Math.ceil(options.length / 25);
  let splitIndex = 0;
  for (let i = 0; i < pageNum; i++) {
    //残りのアイテム数 / 残りのページ数
    const num = Math.ceil((options.length - splitIndex) / (pageNum - i));
    result.push(options.slice(splitIndex, splitIndex + num));
    splitIndex += num;
  }
  return result;
};
