import {
  Row,
  useSingleSelectComponent,
  useButtonComponent,
  useState,
  useUserSingleSelectComponent,
} from "discord-inquirer";

import type { Prompt, Snowflake } from "discord-inquirer";

export type MultiMessageSubType = "button" | "select";

export type MainPromptAnswer = {
  setSubPage: MultiMessageSubType;
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
