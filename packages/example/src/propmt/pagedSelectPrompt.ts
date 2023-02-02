import {
  usePagedSelectComponent,
  Button,
  closeSplitter,
  Row,
  useButtonComponent,
} from "discord-inquirer";

import type { Prompt } from "discord-inquirer";

const allOptions = [...Array(30)].map((_, i) => ({
  label: `${i}`,
  payload: i,
}));

export const pagedSelectPrompt = ((answer, close) => {
  const { setPage, page, pageNum, result, Select, stateAccessor } =
    usePagedSelectComponent({
      optionsResolver: closeSplitter(allOptions),
      showSelectedAlways: false,
      pageTorus: true,
      onSelected: (selected) => {
        console.log("completelySelected", selected);
      },
    });

  const ReverseSetButton = useButtonComponent({
    onClick: () => {
      stateAccessor.setEach((selected) => !selected);
    },
  });

  const PrevButton = useButtonComponent({
    onClick: () => {
      setPage((page) => page - 1);
    },
  });
  const NextButton = useButtonComponent({
    onClick: () => {
      setPage((page) => page + 1);
    },
  });

  return {
    content: `selected: ${result
      .filter((item) => item.selected)
      .map((item) => item.payload)
      .join(",")}`,
    components: [
      Row(Select()),
      Row(
        PrevButton({ style: "primary", label: "prev" })(),
        Button({
          customId: "pageShow",
          style: "secondary",
          label: `${page + 1}/${pageNum}`,
          disabled: true,
        })(),
        NextButton({ style: "primary", label: "next" })(),
        ReverseSetButton({ style: "success", label: "reverse set" })()
      ),
    ],
  };
}) satisfies Prompt<{
  value: number;
}>;
