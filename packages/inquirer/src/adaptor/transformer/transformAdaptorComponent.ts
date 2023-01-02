import {
  ButtonStyle,
  ChannelType,
  ComponentType,
  TextInputStyle,
} from "discord-api-types/v10";

import type {
  AdaptorButtonComponent,
  AdaptorChannelSelectComponent,
  AdaptorChannelTypes,
  AdaptorMentionableSelectComponent,
  AdaptorMessageActionRowComponent,
  AdaptorMessageComponent,
  AdaptorModalActionRowComponent,
  AdaptorNonLinkButtonComponent,
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
} from "discord-api-types/payloads/v10/channel";
import type {
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
} from "discord-api-types/v10";

export const transformAdaptorActionRowComponent = (
  component: AdaptorMessageActionRowComponent
): APIActionRowComponent<APIMessageActionRowComponent> => ({
  type: ComponentType.ActionRow,
  components: component.components.map(transformAdaptorComponent),
});

export const transformAdaptorComponent = (
  component: AdaptorMessageComponent
): APIMessageActionRowComponent => {
  switch (component.type) {
    case "button":
      return transformAdaptorButtonComponent(component);
    case "stringSelect":
      return transformAdaptorStringSelectComponent(component);
    case "userSelect":
      return transformAdaptorUserSelectComponent(component);
    case "roleSelect":
      return transformAdaptorRoleSelectComponent(component);
    case "mentionableSelect":
      return transformAdaptorMentionableSelectComponent(component);
    case "channelSelect":
      return transformAdaptorChannelSelectComponent(component);
  }
};

export const transformAdaptorModalActionRowComponent = (
  component: AdaptorModalActionRowComponent
): APIActionRowComponent<APIModalActionRowComponent> => {
  return {
    type: ComponentType.ActionRow,
    components: component.components.map(transformAdaptorTextInputComponent),
  };
};

const transformAdaptorEmoji = (
  emoji: AdaptorPartialEmoji
): APIMessageComponentEmoji => ({
  id: emoji.id ?? undefined,
  name: emoji.name ?? undefined,
  animated: emoji.animated,
});

const buttonStyleMap = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
} as const satisfies Record<
  AdaptorNonLinkButtonComponent["style"],
  ButtonStyle
>;

export const transformAdaptorButtonComponent = (
  component: AdaptorButtonComponent
): APIButtonComponent => {
  if (component.style === "link") {
    return {
      type: ComponentType.Button,
      label: component.label,
      emoji: component.emoji && transformAdaptorEmoji(component.emoji),
      style: ButtonStyle.Link,
      url: component.url,
      disabled: component.disabled,
    };
  } else {
    return {
      type: ComponentType.Button,
      label: component.label,
      emoji: component.emoji && transformAdaptorEmoji(component.emoji),
      style: buttonStyleMap[component.style],
      custom_id: component.customId,
      disabled: component.disabled,
    };
  }
};

export const transformAdaptorSelectComponentBase = (
  component: AdaptorSelectComponentBase
): Omit<APIBaseSelectMenuComponent<never>, "type"> => ({
  custom_id: component.customId,
  placeholder: component.placeholder,
  min_values: component.minValues,
  max_values: component.maxValues,
  disabled: component.disabled,
});

export const transformAdaptorStringSelectComponent = (
  component: AdaptorStringSelectComponent<unknown>
): APIStringSelectComponent => ({
  type: ComponentType.StringSelect,
  options: component.options.map(transformAdaptorSelectOption),
  ...transformAdaptorSelectComponentBase(component),
});

export const transformAdaptorSelectOption = (
  option: AdaptorSelectOption<unknown>
): APISelectMenuOption => ({
  label: option.label,
  value: option.value,
  description: option.description,
  emoji: option.emoji && transformAdaptorEmoji(option.emoji),
  default: option.default,
});

export const transformAdaptorUserSelectComponent = (
  component: AdaptorUserSelectComponent
): APIUserSelectComponent => ({
  type: ComponentType.UserSelect,
  ...transformAdaptorSelectComponentBase(component),
});

export const transformAdaptorRoleSelectComponent = (
  component: AdaptorRoleSelectComponent
): APIRoleSelectComponent => ({
  type: ComponentType.RoleSelect,
  ...transformAdaptorSelectComponentBase(component),
});

export const transformAdaptorMentionableSelectComponent = (
  component: AdaptorMentionableSelectComponent
): APIMentionableSelectComponent => ({
  type: ComponentType.MentionableSelect,
  ...transformAdaptorSelectComponentBase(component),
});

export const transformAdaptorChannelSelectComponent = (
  component: AdaptorChannelSelectComponent
): APIChannelSelectComponent => ({
  type: ComponentType.ChannelSelect,
  channel_types: component.channelTypes?.map((item) =>
    transformAdaptorChannelType(item)
  ),
  ...transformAdaptorSelectComponentBase(component),
});

//TODO structureのadaptorChannelTypesMapと重複しているので統一する
const channelTypeMap = {
  guildText: ChannelType.GuildText,
  dm: ChannelType.DM,
  guildVoice: ChannelType.GuildVoice,
  groupDm: ChannelType.GroupDM,
  guildCategory: ChannelType.GuildCategory,
  guildAnnouncement: ChannelType.GuildAnnouncement,
  announcementThread: ChannelType.AnnouncementThread,
  publicThread: ChannelType.PublicThread,
  privateThread: ChannelType.PrivateThread,
  guildStageVoice: ChannelType.GuildStageVoice,
  guildDirectory: ChannelType.GuildDirectory,
  guildForum: ChannelType.GuildForum,
} as const satisfies Record<AdaptorChannelTypes, ChannelType>;

export const transformAdaptorChannelType = (
  channelType: AdaptorChannelTypes
): ChannelType => channelTypeMap[channelType];

export const transformAdaptorTextInputComponent = (
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
