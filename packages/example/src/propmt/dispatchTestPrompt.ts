import { randomUUID } from "crypto";
import {
  Row,
  useButtonComponent,
  useEffect,
  useLogger,
  useState,
} from "discord-inquirer";

import type { Prompt } from "discord-inquirer";

export const dispatchExamplePrompt = ((answer, close) => {
  const [count, setCount] = useState(0);
  const [closed, setClosed] = useState(false);

  const logger = useLogger();

  const PlusButton = useButtonComponent({
    onClick: () => {
      setCount((page) => page + 1);
    },
  });

  const PlusPlusButton = useButtonComponent({
    onClick: () => {
      logger.log("debug", "setCountTwice");
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

    logger.log("debug", `mounted ${id}`);
    return () => {
      logger.log("debug", `unmounted ${id}`);
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
