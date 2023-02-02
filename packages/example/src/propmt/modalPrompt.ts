import { Row, useModalComponent } from "discord-inquirer";

import type { Prompt } from "discord-inquirer";

export const modalPrompt: Prompt<{
  value: string;
}> = (answer, close) => {
  const [result, Button] = useModalComponent({
    title: "The modal",
    components: [
      {
        key: "bar",
        label: "bar",
        style: "short",
      },
    ],
    onSubmit: (result) => {
      answer("value", result.bar);
    },
  });

  return {
    content:
      result === null
        ? `please click open modal button!`
        : `value: ${result.bar}`,
    components: [
      Row(
        Button({
          style: "success",
          label: "open modal",
        })()
      ),
    ],
  };
};
