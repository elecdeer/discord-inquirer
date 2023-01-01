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

export const transformActionRowComponent = (
  component: AdaptorMessageActionRowComponent
): APIActionRowComponent<APIMessageActionRowComponent> => ({
  type: ComponentType.ActionRow,
  components: component.components.map(transformComponent),
});

export const transformComponent = (
  component: AdaptorMessageComponent
): APIMessageActionRowComponent => {
  switch (component.type) {
    case "button":
      return transformButtonComponent(component);
    case "stringSelect":
      return transformStringSelectComponent(component);
    case "userSelect":
      return transformUserSelectComponent(component);
    case "roleSelect":
      return transformRoleSelectComponent(component);
    case "mentionableSelect":
      return transformMentionableSelectComponent(component);
    case "channelSelect":
      return transformChannelSelectComponent(component);
  }
};

export const transformModalActionRowComponent = (
  component: AdaptorModalActionRowComponent
): APIActionRowComponent<APIModalActionRowComponent> => {
  return {
    type: ComponentType.ActionRow,
    components: component.components.map(transformTextInputComponent),
  };
};

const transformEmoji = (
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

export const transformButtonComponent = (
  component: AdaptorButtonComponent
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
      style: buttonStyleMap[component.style],
      custom_id: component.customId,
      disabled: component.disabled,
    };
  }
};

export const transformSelectComponentBase = (
  component: AdaptorSelectComponentBase
): Omit<APIBaseSelectMenuComponent<never>, "type"> => ({
  custom_id: component.customId,
  placeholder: component.placeholder,
  min_values: component.minValues,
  max_values: component.maxValues,
  disabled: component.disabled,
});

export const transformStringSelectComponent = (
  component: AdaptorStringSelectComponent<unknown>
): APIStringSelectComponent => ({
  type: ComponentType.StringSelect,
  options: component.options.map(transformSelectOption),
  ...transformSelectComponentBase(component),
});

export const transformSelectOption = (
  option: AdaptorSelectOption<unknown>
): APISelectMenuOption => ({
  label: option.label,
  value: option.value,
  description: option.description,
  emoji: option.emoji && transformEmoji(option.emoji),
  default: option.default,
});

export const transformUserSelectComponent = (
  component: AdaptorUserSelectComponent
): APIUserSelectComponent => ({
  type: ComponentType.UserSelect,
  ...transformSelectComponentBase(component),
});

export const transformRoleSelectComponent = (
  component: AdaptorRoleSelectComponent
): APIRoleSelectComponent => ({
  type: ComponentType.RoleSelect,
  ...transformSelectComponentBase(component),
});

export const transformMentionableSelectComponent = (
  component: AdaptorMentionableSelectComponent
): APIMentionableSelectComponent => ({
  type: ComponentType.MentionableSelect,
  ...transformSelectComponentBase(component),
});

export const transformChannelSelectComponent = (
  component: AdaptorChannelSelectComponent
): APIChannelSelectComponent => ({
  type: ComponentType.ChannelSelect,
  channel_types: component.channelTypes?.map((item) =>
    transformChannelType(item)
  ),
  ...transformSelectComponentBase(component),
});

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

export const transformChannelType = (
  channelType: AdaptorChannelTypes
): ChannelType => channelTypeMap[channelType];

export const transformTextInputComponent = (
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
