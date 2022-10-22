import { renderButtonComponent } from "../component";
import { useButtonEvent } from "./useButtonEvent";
import { useCustomId } from "./useCustomId";
import { useState } from "./useState";

import type { ButtonComponent } from "../adaptor";
import type { ButtonProps } from "../component";

export type UseCountButtonComponentResult = [
  count: number,
  renderButton: (props: ButtonProps) => ButtonComponent
];

export const useCountButtonComponent = (): UseCountButtonComponentResult => {
  const customId = useCustomId("countButton");
  const [count, setCount] = useState(0);

  useButtonEvent(customId, async (_, deferUpdate) => {
    await deferUpdate();
    setCount((prev) => prev + 1);
  });

  const renderComponent = renderButtonComponent(customId);
  return [count, renderComponent];
};
