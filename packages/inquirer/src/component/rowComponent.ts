import type { MessageActionRowComponent } from "../adaptor";

export const Row = (
  ...components: MessageActionRowComponent["components"]
): MessageActionRowComponent => {
  return {
    type: "row",
    components: components,
  };
};
