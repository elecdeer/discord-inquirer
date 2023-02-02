import { randomUUID } from "crypto";
import {
  batchDispatch,
  getHookContext,
  Row,
  useButtonComponent,
  useEffect,
  useState,
} from "discord-inquirer";

import type { Prompt } from "discord-inquirer";

export const dispatchExamplePrompt = ((answer, close) => {
  const [count, setCount] = useState(0);
  const ctx = getHookContext();

  const PlusButton = useButtonComponent({
    onClick: () => {
      setCount((page) => page + 1);
    },
  });
  // const ctx = getHookContext();
  const PlusPlusButton = useButtonComponent({
    onClick: () => {
      console.log("setCountTwice");
      setCount((page) => page + 1);
      setCount((page) => page + 1);
    },
  });

  const PlusPlusBatchedButton = useButtonComponent({
    onClick: () => {
      batchDispatch(ctx, () => {
        console.log("setCountTwice");
        setCount((page) => page + 1);
        setCount((page) => page + 1);
      });
    },
  });

  if (count < 5) {
    // console.log("setCountInRender", count);
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
    content: `count: ${count}`,
    components: [
      Row(
        PlusButton({ style: "primary", label: "+" })(),
        PlusPlusButton({ style: "primary", label: "++" })(),
        PlusPlusBatchedButton({ style: "primary", label: "++ batched" })()
      ),
    ],
  };
}) satisfies Prompt<{
  value: number;
}>;
