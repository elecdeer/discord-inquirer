import type { SelectMenuComponent } from "../adaptor";

export type SelectProps = Omit<
  SelectMenuComponent<unknown>,
  "type" | "customId"
>;

export type SelectOptionProps = Pick<
  SelectProps,
  "options" | "maxValues" | "minValues"
>;
export type SelectDisplayProps = Pick<SelectProps, "disabled" | "placeholder">;

export const renderSelectComponent =
  (customId: string, optionProps: SelectOptionProps) =>
  (props: SelectDisplayProps): SelectMenuComponent<unknown> => {
    return {
      ...optionProps,
      ...props,
      type: "menu",
      customId,
    };
  };
