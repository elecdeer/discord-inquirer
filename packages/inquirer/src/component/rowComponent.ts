import type { MessageActionRowComponent } from "../adaptor";

export const renderRowComponent = (
  ...components: MessageActionRowComponent["components"]
): MessageActionRowComponent => {
  return {
    type: "row",
    components: components,
  };
};
