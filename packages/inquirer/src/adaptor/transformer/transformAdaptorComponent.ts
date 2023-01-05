import {
  ButtonStyle,
  ComponentType,
  TextInputStyle,
} from "discord-api-types/v10";

import { buttonStyleMap, channelTypesMap } from "../structure";
import { transformers } from "./index";

import type {
  AdaptorButtonComponent,
  AdaptorChannelSelectComponent,
  AdaptorChannelTypes,
  AdaptorMentionableSelectComponent,
  AdaptorMessageActionRowComponent,
  AdaptorMessageComponent,
  AdaptorModalActionRowComponent,
  AdaptorPartialEmoji,
  AdaptorRoleSelectComponent,
  AdaptorSelectComponentBase,
  AdaptorSelectOption,
  AdaptorStringSelectComponent,
  AdaptorTextInputComponent,
  AdaptorUserSelectComponent,
} from "../structure";
import type {
  APIBaseSelectMenuComponent,
  APIModalActionRowComponent,
  APIStringSelectComponent,
  APIActionRowComponent,
  APIButtonComponent,
  APIChannelSelectComponent,
  APIMentionableSelectComponent,
  APIMessageActionRowComponent,
  APIMessageComponentEmoji,
  APIRoleSelectComponent,
  APISelectMenuOption,
  APITextInputComponent,
  APIUserSelectComponent,
  ChannelType,
} from "discord-api-types/v10";

const transformAdaptorActionRowComponent = (
  component: AdaptorMessageActionRowComponent
): APIActionRowComponent<APIMessageActionRowComponent> => ({
  type: ComponentType.ActionRow,
  components: component.components.map(transformers.adaptorComponent),
});

const transformAdaptorComponent = (
  component: AdaptorMessageComponent
): APIMessageActionRowComponent => {
  switch (component.type) {
    case "button":
      return transformers.adaptorButtonComponent(component);
    case "stringSelect":
      return transformers.adaptorStringSelectComponent(component);
    case "userSelect":
      return transformers.adaptorUserSelectComponent(component);
    case "roleSelect":
      return transformers.adaptorRoleSelectComponent(component);
    case "mentionableSelect":
      return transformers.adaptorMentionableSelectComponent(component);
    case "channelSelect":
      return transformers.adaptorChannelSelectComponent(component);
  }
};

const transformAdaptorModalActionRowComponent = (
  component: AdaptorModalActionRowComponent
): APIActionRowComponent<APIModalActionRowComponent> => {
  return {
    type: ComponentType.ActionRow,
    components: component.components.map(
      transformers.adaptorTextInputComponent
    ),
  };
};

const transformAdaptorEmoji = (
  emoji: AdaptorPartialEmoji
): APIMessageComponentEmoji => ({
  id: emoji.id ?? undefined,
  name: emoji.name ?? undefined,
  animated: emoji.animated,
});

const transformAdaptorButtonComponent = (
  component: AdaptorButtonComponent
): APIButtonComponent => {
  if (component.style === "link") {
    return {
      type: ComponentType.Button,
      label: component.label,
      emoji: component.emoji && transformers.adaptorEmoji(component.emoji),
      style: ButtonStyle.Link,
      url: component.url,
      disabled: component.disabled,
    };
  } else {
    return {
      type: ComponentType.Button,
      label: component.label,
      emoji: component.emoji && transformers.adaptorEmoji(component.emoji),
      style: buttonStyleMap[component.style],
      custom_id: component.customId,
      disabled: component.disabled,
    };
  }
};

const transformAdaptorSelectComponentBase = (
  component: AdaptorSelectComponentBase
): Omit<APIBaseSelectMenuComponent<never>, "type"> => ({
  custom_id: component.customId,
  placeholder: component.placeholder,
  min_values: component.minValues,
  max_values: component.maxValues,
  disabled: component.disabled,
});

const transformAdaptorStringSelectComponent = (
  component: AdaptorStringSelectComponent<unknown>
): APIStringSelectComponent => ({
  type: ComponentType.StringSelect,
  options: component.options.map(transformers.adaptorSelectOption),
  ...transformers.adaptorSelectComponentBase(component),
});

const transformAdaptorSelectOption = (
  option: AdaptorSelectOption<unknown>
): APISelectMenuOption => ({
  label: option.label,
  value: option.value,
  description: option.description,
  emoji: option.emoji && transformers.adaptorEmoji(option.emoji),
  default: option.default,
});

const transformAdaptorUserSelectComponent = (
  component: AdaptorUserSelectComponent
): APIUserSelectComponent => ({
  type: ComponentType.UserSelect,
  ...transformers.adaptorSelectComponentBase(component),
});

const transformAdaptorRoleSelectComponent = (
  component: AdaptorRoleSelectComponent
): APIRoleSelectComponent => ({
  type: ComponentType.RoleSelect,
  ...transformers.adaptorSelectComponentBase(component),
});

const transformAdaptorMentionableSelectComponent = (
  component: AdaptorMentionableSelectComponent
): APIMentionableSelectComponent => ({
  type: ComponentType.MentionableSelect,
  ...transformers.adaptorSelectComponentBase(component),
});

const transformAdaptorChannelSelectComponent = (
  component: AdaptorChannelSelectComponent
): APIChannelSelectComponent => ({
  type: ComponentType.ChannelSelect,
  channel_types: component.channelTypes?.map((item) =>
    transformers.adaptorChannelType(item)
  ),
  ...transformers.adaptorSelectComponentBase(component),
});

const transformAdaptorChannelType = (
  channelType: AdaptorChannelTypes
): ChannelType => channelTypesMap[channelType];

const transformAdaptorTextInputComponent = (
  component: AdaptorTextInputComponent
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

export const transformersAdaptorComponent = {
  adaptorActionRowComponent: transformAdaptorActionRowComponent,
  adaptorComponent: transformAdaptorComponent,
  adaptorModalActionRowComponent: transformAdaptorModalActionRowComponent,
  adaptorEmoji: transformAdaptorEmoji,
  adaptorButtonComponent: transformAdaptorButtonComponent,
  adaptorSelectComponentBase: transformAdaptorSelectComponentBase,
  adaptorStringSelectComponent: transformAdaptorStringSelectComponent,
  adaptorSelectOption: transformAdaptorSelectOption,
  adaptorUserSelectComponent: transformAdaptorUserSelectComponent,
  adaptorRoleSelectComponent: transformAdaptorRoleSelectComponent,
  adaptorMentionableSelectComponent: transformAdaptorMentionableSelectComponent,
  adaptorChannelSelectComponent: transformAdaptorChannelSelectComponent,
  adaptorChannelType: transformAdaptorChannelType,
  adaptorTextInputComponent: transformAdaptorTextInputComponent,
};
