import {
  ButtonStyle,
  ComponentType,
  TextInputStyle,
} from "discord-api-types/v10";

import type {
  MessageActionRowComponent,
  ButtonComponent,
  MessageComponent,
  PartialEmoji,
  StringSelectComponent,
  SelectOption,
  TextInputComponent,
} from "../structure";
import type { ModalActionRowComponent } from "../structure";
import type { APIModalActionRowComponent } from "discord-api-types/payloads/v10/channel";
import type {
  APIActionRowComponent,
  APIButtonComponent,
  APIMessageActionRowComponent,
  APIMessageComponentEmoji,
  APISelectMenuComponent,
  APISelectMenuOption,
  APITextInputComponent,
} from "discord-api-types/v10";

export const transformActionRowComponent = (
  component: MessageActionRowComponent
): APIActionRowComponent<APIMessageActionRowComponent> => ({
  type: ComponentType.ActionRow,
  components: component.components.map(transformComponent),
});

export const transformComponent = (
  component: MessageComponent
): APIMessageActionRowComponent => {
  switch (component.type) {
    case "button":
      return transformButtonComponent(component);
    case "stringSelect":
      return transformSelectComponent(component);
  }
};

export const transformModalActionRowComponent = (
  component: ModalActionRowComponent
): APIActionRowComponent<APIModalActionRowComponent> => {
  return {
    type: ComponentType.ActionRow,
    components: component.components.map(transformTextInputComponent),
  };
};

const transformEmoji = (emoji: PartialEmoji): APIMessageComponentEmoji => ({
  id: emoji.id ?? undefined,
  name: emoji.name ?? undefined,
  animated: emoji.animated,
});

const styleMap = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
} as const;

export const transformButtonComponent = (
  component: ButtonComponent
): APIButtonComponent => {
  if (component.style === "link") {
    return {
      type: ComponentType.Button,
      label: component.label,
      emoji: component.emoji && transformEmoji(component.emoji),
      style: ButtonStyle.Link,
      url: component.url,
      disabled: component.disabled,
    };
  } else {
    return {
      type: ComponentType.Button,
      label: component.label,
      emoji: component.emoji && transformEmoji(component.emoji),
      style: styleMap[component.style],
      custom_id: component.customId,
      disabled: component.disabled,
    };
  }
};

export const transformSelectComponent = (
  component: StringSelectComponent<unknown>
): APISelectMenuComponent => ({
  type: ComponentType.SelectMenu,
  custom_id: component.customId,
  options: component.options.map(transformSelectOption),
  placeholder: component.placeholder,
  min_values: component.minValues,
  max_values: component.maxValues,
  disabled: component.disabled,
});

export const transformSelectOption = (
  option: SelectOption<unknown>
): APISelectMenuOption => ({
  label: option.label,
  value: option.value,
  description: option.description,
  emoji: option.emoji && transformEmoji(option.emoji),
  default: option.default,
});

export const transformTextInputComponent = (
  component: TextInputComponent
): APITextInputComponent => ({
  type: ComponentType.TextInput,
  custom_id: component.customId,
  style: {
    short: TextInputStyle.Short,
    paragraph: TextInputStyle.Paragraph,
  }[component.style],
  label: component.label,
  min_length: component.minLength,
  max_length: component.maxLength,
  required: component.required,
  value: component.value,
  placeholder: component.placeholder,
});
