import { Button } from "../../adaptor";
import { useButtonEvent } from "../effect/useButtonEvent";
import { useEffect } from "../effect/useEffect";
import { useCustomId } from "../state/useCustomId";
import { useRef } from "../state/useRef";
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

  const valueChanged = useRef(false);

  useButtonEvent(customId, async (_, deferUpdate) => {
    await deferUpdate();
    setCount((prev) => prev + 1);

    valueChanged.current = true;
  });

  //あまり良い実装ではない
  useEffect(() => {
    if (valueChanged.current) {
      onChange?.(count);
      valueChanged.current = false;
    }
  }, [count]);

  const renderComponent = Button({ customId });
  return [count, renderComponent];
};
