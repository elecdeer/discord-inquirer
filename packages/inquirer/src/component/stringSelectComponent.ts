import type { StringSelectComponent } from "../adaptor";

export type StringSelectProps = Omit<
  StringSelectComponent<unknown>,
  "type" | "customId"
>;

export type StringSelectOptionProps = Pick<
  StringSelectProps,
  "options" | "maxValues" | "minValues"
>;
export type StringSelectDisplayProps = Pick<
  StringSelectProps,
  "disabled" | "placeholder"
>;

const renderStringSelectComponent =
  (customId: string, optionProps: StringSelectOptionProps) =>
  (props: StringSelectDisplayProps): StringSelectComponent<unknown> => {
    return {
      ...optionProps,
      ...props,
      type: "stringSelect",
      customId,
    };
  };

export function StringSelect(
  customId: string,
  optionProps: StringSelectOptionProps,
  props: StringSelectDisplayProps
): StringSelectComponent<unknown>;
export function StringSelect(
  customId: string,
  optionProps: StringSelectOptionProps,
  props?: undefined
): (props: StringSelectDisplayProps) => StringSelectComponent<unknown>;
export function StringSelect(
  customId: string,
  optionProps: StringSelectOptionProps,
  props: StringSelectDisplayProps | undefined
) {
  if (props === undefined) {
    return renderStringSelectComponent(customId, optionProps);
  } else {
    return renderStringSelectComponent(customId, optionProps)(props);
  }
}
