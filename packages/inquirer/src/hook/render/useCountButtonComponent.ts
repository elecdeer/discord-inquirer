import { Button } from "../../component";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type { ButtonComponent } from "../../adaptor";
import type { ButtonProps } from "../../component";

export type UseCountButtonComponentResult = [
  count: number,
  CountButton: (props: ButtonProps) => ButtonComponent
];

export const useCountButtonComponent = (): UseCountButtonComponentResult => {
  const customId = useCustomId("countButton");
  const [count, setCount] = useState(0);

  useButtonEvent(customId, async (_, deferUpdate) => {
    await deferUpdate();
    setCount((prev) => prev + 1);
  });

  const renderComponent = Button(customId);
  return [count, renderComponent];
};
