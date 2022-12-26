import {
  ButtonStyle,
  ChannelType,
  ComponentType,
  TextInputStyle,
} from "discord-api-types/v10";

import type {
  ChannelTypes,
  MentionableSelectComponent,
  NonLinkButtonComponent,
} from "../structure";
import type {
  MessageActionRowComponent,
  ButtonComponent,
  MessageComponent,
  PartialEmoji,
  StringSelectComponent,
  SelectOption,
  TextInputComponent,
  SelectComponentBase,
  UserSelectComponent,
  RoleSelectComponent,
  ChannelSelectComponent,
} from "../structure";
import type { ModalActionRowComponent } from "../structure";
import type { APIStringSelectComponent } from "discord-api-types/payloads/v10/channel";
import type { APIBaseSelectMenuComponent } from "discord-api-types/payloads/v10/channel";
import type { APIModalActionRowComponent } from "discord-api-types/payloads/v10/channel";
import type {
  APIActionRowComponent,
  APIButtonComponent,
  APIMessageActionRowComponent,
  APIMessageComponentEmoji,
  APISelectMenuOption,
  APITextInputComponent,
  APIUserSelectComponent,
  APIChannelSelectComponent,
  APIMentionableSelectComponent,
  APIRoleSelectComponent,
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

const buttonStyleMap = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
} as const satisfies Record<NonLinkButtonComponent["style"], ButtonStyle>;

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
      style: buttonStyleMap[component.style],
      custom_id: component.customId,
      disabled: component.disabled,
    };
  }
};

export const transformSelectComponentBase = (
  component: SelectComponentBase
): Omit<APIBaseSelectMenuComponent<never>, "type"> => ({
  custom_id: component.customId,
  placeholder: component.placeholder,
  min_values: component.minValues,
  max_values: component.maxValues,
  disabled: component.disabled,
});

export const transformStringSelectComponent = (
  component: StringSelectComponent<unknown>
): APIStringSelectComponent => ({
  type: ComponentType.StringSelect,
  options: component.options.map(transformSelectOption),
  ...transformSelectComponentBase(component),
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

export const transformUserSelectComponent = (
  component: UserSelectComponent
): APIUserSelectComponent => ({
  type: ComponentType.UserSelect,
  ...transformSelectComponentBase(component),
});

export const transformRoleSelectComponent = (
  component: RoleSelectComponent
): APIRoleSelectComponent => ({
  type: ComponentType.RoleSelect,
  ...transformSelectComponentBase(component),
});

export const transformMentionableSelectComponent = (
  component: MentionableSelectComponent
): APIMentionableSelectComponent => ({
  type: ComponentType.MentionableSelect,
  ...transformSelectComponentBase(component),
});

export const transformChannelSelectComponent = (
  component: ChannelSelectComponent
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
} as const satisfies Record<ChannelTypes, ChannelType>;

export const transformChannelType = (channelType: ChannelTypes): ChannelType =>
  channelTypeMap[channelType];

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
