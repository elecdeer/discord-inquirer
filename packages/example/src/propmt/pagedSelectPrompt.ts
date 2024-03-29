import {
  usePagedSelectComponent,
  Button,
  closeSplitter,
  Row,
  useButtonComponent,
  useLogger,
} from "discord-inquirer";

import type { Prompt } from "discord-inquirer";

const generateOptions = (size: number) =>
  Array.from({ length: size }, (_, index) => ({
    label: `${index}`,
    payload: index,
  }));

const allOptions = generateOptions(30);

export const pagedSelectPrompt = (() => {
  const logger = useLogger();
  const { setPage, page, pageNum, result, Select, stateAccessor } =
    usePagedSelectComponent({
      optionsResolver: closeSplitter(allOptions),
      showSelectedAlways: false,
      pageTorus: true,
      onSelected: (selected) => {
        logger.log("debug", {
          selected,
        });
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
        ReverseSetButton({ style: "success", label: "reverse set" })(),
      ),
    ],
  };
}) satisfies Prompt<{
  value: number;
}>;
