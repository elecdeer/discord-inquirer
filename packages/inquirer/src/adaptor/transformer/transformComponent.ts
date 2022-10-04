import {
  ButtonStyle,
  ComponentType,
  TextInputStyle,
} from "discord-api-types/v10";

import type {
  ActionRowComponent,
  ButtonComponent,
  Component,
  Emoji,
  SelectMenuComponent,
  SelectOption,
  TextInputComponent,
} from "../structure";
import type {
  APIActionRowComponent,
  APIButtonComponent,
  APIMessageComponentEmoji,
  APISelectMenuComponent,
  APISelectMenuOption,
  APITextInputComponent,
  APIMessageActionRowComponent,
} from "discord-api-types/v10";

export const transformActionRowComponent = (
  component: ActionRowComponent
): APIActionRowComponent<APIMessageActionRowComponent> => ({
  type: ComponentType.ActionRow,
  components: component.components.map(transformComponent),
});

export const transformComponent = (
  component: Component
): APIMessageActionRowComponent => {
  switch (component.type) {
    case "button":
      return transformButtonComponent(component);
    case "menu":
      return transformSelectComponent(component);
  }
};

const transformEmoji = (emoji: Emoji): APIMessageComponentEmoji => ({
  id: emoji.id,
  name: emoji.name,
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
  component: SelectMenuComponent<unknown>
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
  value: option.key,
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
