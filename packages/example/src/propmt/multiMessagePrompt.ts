import {
  Row,
  useSingleSelectComponent,
  useButtonComponent,
  useState,
  useUserSingleSelectComponent,
  useMultiPagePrompt,
  useEffect,
} from "discord-inquirer";

import type { Prompt, Snowflake, InquireResultEvent } from "discord-inquirer";

export type MultiMessageSubType = "button" | "select";

export type MainPromptAnswer = {
  setSubPage: MultiMessageSubType;
  close: "empty";
};

export const mainPrompt: Prompt<MainPromptAnswer> = (answer, close) => {
  const [_, SelectComponent] = useSingleSelectComponent({
    options: [
      {
        label: "Button",
        payload: "button",
      },
      {
        label: "Select",
        payload: "select",
      },
    ] as const,
    minValues: 1,
    onSelected: (selected) => {
      if (selected) {
        answer("setSubPage", selected.payload);
      }
    },
  });

  const CloseButton = useButtonComponent({
    onClick: () => {
      answer("close", "empty");
      close();
    },
  });

  return {
    content: "Select a sub page",
    components: [
      Row(SelectComponent()),
      Row(CloseButton({ style: "danger", label: "Close" })()),
    ],
  };
};

export const subPromptButton: Prompt<{
  count: number;
}> = (answer) => {
  const [count, setCount] = useState(0);

  const Button = useButtonComponent({
    onClick: () => {
      const nextCount = count + 1;
      setCount(nextCount);
      answer("count", nextCount);
    },
  });

  return {
    content: `Count: ${count}`,
    components: [Row(Button({ style: "success", label: "++" })())],
  };
};

export const subPromptSelect: Prompt<{
  userId: Snowflake;
}> = (answer) => {
  const [selected, SelectComponent] = useUserSingleSelectComponent({
    minValues: 1,
    onSelected: (selected) => {
      if (selected) {
        answer("userId", selected.id);
      }
    },
  });

  return {
    content: `Selected: ${selected?.username}`,
    components: [Row(SelectComponent())],
  };
};

export const subPrompt =
  (
    mainPageResultEvent: InquireResultEvent<MainPromptAnswer>
  ): Prompt<{
    count: number;
    userId: Snowflake;
  }> =>
  (answer, close) => {
    //promptの順番を変えてはいけない
    const { setPage, result } = useMultiPagePrompt(
      {
        button: () => subPromptButton(answer, close),
        select: () => subPromptSelect(answer, close),
      },
      "button"
    );

    useEffect(() => {
      const { off } = mainPageResultEvent.on(({ key, value }) => {
        if (key === "setSubPage") {
          console.log("set sub page", value);
          setPage(value);
        }
      });
      return () => {
        off();
      };
    });

    return result;
  };
