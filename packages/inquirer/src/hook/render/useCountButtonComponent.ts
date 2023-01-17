import { Button } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type { ButtonComponentBuilder } from "../../adaptor";

export type UseCountButtonComponentResult = [
  count: number,
  CountButton: ButtonComponentBuilder<{
    customId: string;
  }>
];

export const useCountButtonComponent = ({
  onChange,
}: {
  onChange?: (count: number) => void;
}): UseCountButtonComponentResult => {
  const customId = useCustomId("countButton");
  const [count, setCount] = useState(0);

  const markChanged = useObserveValue(count, onChange);

  useButtonEvent(customId, async (_, deferUpdate) => {
    await deferUpdate();
    setCount((prev) => prev + 1);

    markChanged();
  });

  const renderComponent = Button({ customId });
  return [count, renderComponent];
};
