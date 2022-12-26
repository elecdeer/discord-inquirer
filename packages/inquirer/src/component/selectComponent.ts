import type { StringSelectComponent } from "../adaptor";

export type SelectProps = Omit<
  StringSelectComponent<unknown>,
  "type" | "customId"
>;

export type SelectOptionProps = Pick<
  SelectProps,
  "options" | "maxValues" | "minValues"
>;
export type SelectDisplayProps = Pick<SelectProps, "disabled" | "placeholder">;

const renderSelectComponent =
  (customId: string, optionProps: SelectOptionProps) =>
  (props: SelectDisplayProps): StringSelectComponent<unknown> => {
    return {
      ...optionProps,
      ...props,
      type: "stringSelect",
      customId,
    };
  };

export function Select(
  customId: string,
  optionProps: SelectOptionProps,
  props: SelectDisplayProps
): StringSelectComponent<unknown>;
export function Select(
  customId: string,
  optionProps: SelectOptionProps,
  props?: undefined
): (props: SelectDisplayProps) => StringSelectComponent<unknown>;
export function Select(
  customId: string,
  optionProps: SelectOptionProps,
  props: SelectDisplayProps | undefined
) {
  if (props === undefined) {
    return renderSelectComponent(customId, optionProps);
  } else {
    return renderSelectComponent(customId, optionProps)(props);
  }
}
