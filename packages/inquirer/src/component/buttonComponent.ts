import type { NonLinkButtonComponent } from "../adaptor";

export type ButtonProps = Omit<
  NonLinkButtonComponent,
  "type" | "url" | "customId"
>;

const renderButtonComponent =
  (customId: string) =>
  (props: ButtonProps): NonLinkButtonComponent => {
    return {
      ...props,
      type: "button",
      customId,
    };
  };

export function Button(
  customId: string,
  props: ButtonProps
): NonLinkButtonComponent;
export function Button(
  customId: string,
  props?: undefined
): (props: ButtonProps) => NonLinkButtonComponent;
export function Button(customId: string, props: ButtonProps | undefined) {
  if (props === undefined) {
    return renderButtonComponent(customId);
  } else {
    return renderButtonComponent(customId)(props);
  }
}
