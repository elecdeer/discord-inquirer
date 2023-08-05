import { useState } from "../state/useState";

import type { MessageMutualPayload } from "../../adaptor";
import type { Prompt } from "../../core/inquire";

export type UseMultiPagePromptResult<
  TPagesKeys extends string | number | symbol,
  TAnswer extends Record<string, unknown>,
> = {
  setPage: (page: TPagesKeys) => void;
  result: ReturnType<Prompt<TAnswer>>;
};

/**
 * 複数のページを持つPromptを作りやすくするためのhook
 * 各ページの状態は常に保持される
 * @param renderPages 各ページのPromptをRenderする関数のEntries 毎renderごとで順序が変わってはいけない
 * @param defaultPage 初期表示するページのキー
 * @returns {setPage, result}
 */
export const useMultiPagePrompt = <
  TPagesKeys extends string | number | symbol,
  TAnswer extends Record<string, unknown>,
>(
  renderPages: [TPagesKeys, () => ReturnType<Prompt<TAnswer>>][],
  defaultPage: TPagesKeys,
): UseMultiPagePromptResult<TPagesKeys, TAnswer> => {
  const [page, setPage] = useState<TPagesKeys>(defaultPage);

  //表示されていないページも含めて全てのページをレンダリングする
  const resultMap = new Map<TPagesKeys, MessageMutualPayload>(
    renderPages.map(([key, render]) => [key, render()]),
  );

  if (!resultMap.has(page)) throw new Error("Invalid page");

  return {
    setPage,
    result: resultMap.get(page)!,
  };
};
