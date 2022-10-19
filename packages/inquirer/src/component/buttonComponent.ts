import type { NonLinkButtonComponent } from "../adaptor";

export type ButtonProps = Omit<
  NonLinkButtonComponent,
  "type" | "url" | "customId"
>;

export const renderButtonComponent =
  (customId: string) =>
  (props: ButtonProps): NonLinkButtonComponent => {
    return {
      ...props,
      type: "button",
      customId,
    };
  };
