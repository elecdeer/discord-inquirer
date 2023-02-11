import { randomUUID } from "crypto";
import { Row, useButtonComponent, useEffect, useState } from "discord-inquirer";

import type { Prompt } from "discord-inquirer";

export const dispatchExamplePrompt = ((answer, close) => {
  const [count, setCount] = useState(0);
  const [closed, setClosed] = useState(false);

  const PlusButton = useButtonComponent({
    onClick: () => {
      setCount((page) => page + 1);
    },
  });

  const PlusPlusButton = useButtonComponent({
    onClick: () => {
      console.log("setCountTwice");
      setCount((page) => page + 1);
      setCount((page) => page + 1);
    },
  });

  const CloseButton = useButtonComponent({
    onClick: () => {
      setClosed(true);
      close();
    },
  });

  if (count < 5) {
    setCount((prev) => prev + 1);
  }

  useEffect(() => {
    const id = randomUUID();

    console.log(`mounted ${id}`);
    return () => {
      console.log(`unmounted ${id}`);
    };
  });

  return {
    content: closed ? "closed" : `count: ${count}`,
    components: [
      Row(
        PlusButton({ style: "primary", label: "+" })(),
        PlusPlusButton({ style: "primary", label: "++" })(),
        CloseButton({ style: "danger", label: "close" })()
      ),
    ],
  };
}) satisfies Prompt<{
  value: number;
}>;
