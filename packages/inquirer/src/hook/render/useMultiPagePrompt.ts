import { useState } from "../state/useState";

import type { MessageMutualPayload } from "../../adaptor";
import type { Prompt } from "../../core/inquire";

//渡すrenderPagesの順番を変えてはいけない

export const useMultiPagePrompt = <
  TPages extends Record<
    string | number | symbol,
    () => ReturnType<Prompt<TAnswer>>
  >,
  TAnswer extends Record<string, unknown>
>(
  renderPages: TPages,
  defaultPage: keyof TPages
): {
  setPage: (page: keyof TPages) => void;
  result: ReturnType<Prompt<TAnswer>>;
} => {
  const [page, setPage] = useState<keyof TPages>(defaultPage);

  //表示されていないページも含めて全てのページをレンダリングする
  const resultMap = new Map<keyof TPages, MessageMutualPayload>(
    Object.entries(renderPages).map(([key, renderPrompt]) => [
      key,
      renderPrompt(),
    ])
  );

  if (!resultMap.has(page)) throw new Error("Invalid page");

  return {
    setPage,
    result: resultMap.get(page)!,
  };
};
