import { Button } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type { AdaptorButtonComponent } from "../../adaptor";
import type { UnfulfilledCurriedBuilder } from "../../util/curriedBuilder";

export type UseCountButtonComponentResult = [
  count: number,
  CountButton: UnfulfilledCurriedBuilder<
    AdaptorButtonComponent,
    { type: "button"; customId: string },
    AdaptorButtonComponent
  >
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
