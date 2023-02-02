import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ComponentType,
  InteractionType,
} from "discord-api-types/v10";
import assert from "node:assert";

import { transformers } from "./index";
import { nullishThrough, transformRecordValue } from "./shared";

import type {
  AdaptorApplicationCommandAutoCompleteInteraction,
  AdaptorApplicationCommandInteraction,
  AdaptorApplicationCommandInteractionOption,
  AdaptorApplicationCommandInteractionOptionSubCommand,
  AdaptorApplicationCommandInteractionOptionSubCommandGroup,
  AdaptorInteraction,
  AdaptorInteractionBase,
  AdaptorModalSubmitInteraction,
  AdaptorPingInteraction,
  AdaptorUserInvokedInteractionBase,
  Snowflake,
} from "../structure";
import type {
  APIApplicationCommandInteractionDataBasicOption,
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandInteraction,
  APIApplicationCommandInteractionDataOption,
  APIAttachment,
  APIInteraction,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  APIPingInteraction,
  APIRole,
  APIUser,
} from "discord-api-types/v10";

const transformInteraction = (
  interaction: APIInteraction
): AdaptorInteraction => {
  switch (interaction.type) {
    case InteractionType.Ping:
      return transformers.pingInteraction(interaction);
    case InteractionType.ApplicationCommand:
      return transformers.applicationCommandInteraction(interaction);
    case InteractionType.MessageComponent:
      return transformers.messageComponentInteraction(interaction);
    case InteractionType.ApplicationCommandAutocomplete:
      return transformers.applicationCommandAutocompleteInteraction(
        interaction
      );
    case InteractionType.ModalSubmit:
      return transformers.modalSubmitInteraction(interaction);
  }
};

const transformInteractionBase = (
  interaction: APIInteraction
): AdaptorInteractionBase => {
  return {
    id: interaction.id,
    applicationId: interaction.application_id,
    token: interaction.token,
    version: interaction.version,
  };
};

const transformUserInvokedInteractionBase = (
  interaction:
    | APIApplicationCommandInteraction
    | APIMessageComponentInteraction
    | APIApplicationCommandAutocompleteInteraction
    | APIModalSubmitInteraction
): AdaptorUserInvokedInteractionBase => {
  assert(interaction.channel_id !== undefined);

  const apiUser = interaction.user ?? interaction.member?.user;
  assert(apiUser !== undefined);

  return {
    ...transformers.interactionBase(interaction),
    guildId: interaction.guild_id ?? null,
    channelId: interaction.channel_id,
    member:
      nullishThrough(transformers.partialMember)(interaction.member) ?? null,
    user: transformers.user(apiUser),
    appPermissions:
      nullishThrough(transformers.permissionFlags)(
        interaction.app_permissions
      ) ?? null,
    locale: interaction.locale ?? null,
    guildLocale: interaction.guild_locale ?? null,
  };
};

const transformPingInteraction = (
  interaction: APIPingInteraction
): AdaptorPingInteraction => {
  return {
    type: "ping",
    ...transformers.interactionBase(interaction),
  };
};

const transformApplicationCommandInteraction = (
  interaction: APIApplicationCommandInteraction
): AdaptorApplicationCommandInteraction => {
  if (interaction.data.type === ApplicationCommandType.ChatInput) {
    return {
      type: "applicationCommand",
      ...transformers.userInvokedInteractionBase(interaction),
      data: {
        type: "chatInput",
        id: interaction.data.id,
        name: interaction.data.name,
        options:
          interaction.data.options?.map(
            transformers.applicationCommandInteractionOption
          ) ?? [],
        resolved: {
          users:
            nullishThrough(transformResolvedUsers)(
              interaction.data.resolved?.users
            ) ?? {},
          members:
            nullishThrough(transformResolvedMembers)(
              interaction.data.resolved?.members
            ) ?? {},
          roles:
            nullishThrough(transformResolvedRoles)(
              interaction.data.resolved?.roles
            ) ?? {},
          channels:
            nullishThrough(transformResolvedChannels)(
              interaction.data.resolved?.channels
            ) ?? {},
          attachments:
            nullishThrough(transformResolvedAttachments)(
              interaction.data.resolved?.attachments
            ) ?? {},
        },
        guildId: interaction.guild_id ?? null,
        targetId: null,
      },
    };
  }

  if (interaction.data.type === ApplicationCommandType.User) {
    return {
      type: "applicationCommand",
      ...transformers.userInvokedInteractionBase(interaction),
      data: {
        type: "user",
        id: interaction.data.id,
        name: interaction.data.name,
        options: [],
        resolved: {
          users:
            nullishThrough(transformResolvedUsers)(
              interaction.data.resolved?.users
            ) ?? {},
          members:
            nullishThrough(transformResolvedMembers)(
              interaction.data.resolved?.members
            ) ?? {},
          roles: {},
          channels: {},
          attachments: {},
        },
        guildId: interaction.guild_id ?? null,
        targetId: interaction.data.target_id,
      },
    };
  }

  if (interaction.data.type === ApplicationCommandType.Message) {
    return {
      type: "applicationCommand",
      ...transformers.userInvokedInteractionBase(interaction),
      data: {
        type: "message",
        id: interaction.data.id,
        name: interaction.data.name,
        options: [],
        resolved: {
          users: {},
          members: {},
          roles: {},
          channels: {},
          attachments: {},
        },
        guildId: interaction.guild_id ?? null,
        targetId: interaction.data.target_id,
      },
    };
  }

  throw new Error("Unknown application command type");
};

const transformApplicationCommandInteractionOptionWithoutSub = (
  option: APIApplicationCommandInteractionDataBasicOption
): Exclude<
  AdaptorApplicationCommandInteractionOption,
  | AdaptorApplicationCommandInteractionOptionSubCommand
  | AdaptorApplicationCommandInteractionOptionSubCommandGroup
> => {
  if (option.type === ApplicationCommandOptionType.Number) {
    return {
      type: "number",
      value: option.value,
    };
  }
  if (option.type === ApplicationCommandOptionType.String) {
    return {
      type: "string",
      value: option.value,
    };
  }
  if (option.type === ApplicationCommandOptionType.Boolean) {
    return {
      type: "boolean",
      value: option.value,
    };
  }
  if (option.type === ApplicationCommandOptionType.User) {
    return {
      type: "user",
      value: option.value,
    };
  }
  if (option.type === ApplicationCommandOptionType.Channel) {
    return {
      type: "channel",
      value: option.value,
    };
  }
  if (option.type === ApplicationCommandOptionType.Role) {
    return {
      type: "role",
      value: option.value,
    };
  }
  if (option.type === ApplicationCommandOptionType.Mentionable) {
    return {
      type: "mentionable",
      value: option.value,
    };
  }
  if (option.type === ApplicationCommandOptionType.Integer) {
    return {
      type: "integer",
      value: option.value,
    };
  }
  if (option.type === ApplicationCommandOptionType.Attachment) {
    return {
      type: "attachment",
      value: option.value,
    };
  }
  throw new Error("Unknown option type");
};

const transformApplicationCommandInteractionOption = (
  option: APIApplicationCommandInteractionDataOption
): AdaptorApplicationCommandInteractionOption => {
  if (option.type === ApplicationCommandOptionType.Subcommand) {
    return {
      type: "subCommand",
      name: option.name,
      options:
        option.options?.map(
          transformApplicationCommandInteractionOptionWithoutSub
        ) ?? [],
    };
  }

  if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
    return {
      type: "subCommandGroup",
      name: option.name,
      options:
        option.options?.map((item) => ({
          type: "subCommand",
          name: item.name,
          options:
            item.options?.map(
              transformApplicationCommandInteractionOptionWithoutSub
            ) ?? [],
        })) ?? [],
    };
  }

  return transformApplicationCommandInteractionOptionWithoutSub(option);
};

const transformMessageComponentInteraction = (
  interaction: APIMessageComponentInteraction
): AdaptorInteraction => {
  const base = {
    ...transformers.userInvokedInteractionBase(interaction),
    type: "messageComponent",
  } as const;

  if (interaction.data.component_type === ComponentType.Button) {
    return {
      ...base,
      data: {
        componentType: "button",
        customId: interaction.data.custom_id,
      },
    };
  }

  if (interaction.data.component_type === ComponentType.StringSelect) {
    return {
      ...base,
      data: {
        componentType: "stringSelect",
        customId: interaction.data.custom_id,
        values: interaction.data.values,
      },
    };
  }

  if (interaction.data.component_type === ComponentType.UserSelect) {
    return {
      type: "messageComponent",
      ...transformers.userInvokedInteractionBase(interaction),
      data: {
        componentType: "userSelect",
        customId: interaction.data.custom_id,
        values: interaction.data.values,
        resolved: {
          users:
            nullishThrough(transformResolvedUsers)(
              interaction.data.resolved.users
            ) ?? {},
          members:
            nullishThrough(transformResolvedMembers)(
              interaction.data.resolved.members
            ) ?? {},
        },
      },
    };
  }

  if (interaction.data.component_type === ComponentType.RoleSelect) {
    return {
      type: "messageComponent",
      ...transformers.userInvokedInteractionBase(interaction),
      data: {
        componentType: "roleSelect",
        customId: interaction.data.custom_id,
        values: interaction.data.values,
        resolved: {
          roles:
            nullishThrough(transformResolvedRoles)(
              interaction.data.resolved.roles
            ) ?? {},
        },
      },
    };
  }

  if (interaction.data.component_type === ComponentType.MentionableSelect) {
    return {
      type: "messageComponent",
      ...transformers.userInvokedInteractionBase(interaction),
      data: {
        componentType: "mentionableSelect",
        customId: interaction.data.custom_id,
        values: interaction.data.values,
        resolved: {
          users:
            nullishThrough(transformResolvedUsers)(
              interaction.data.resolved.users
            ) ?? {},
          members:
            nullishThrough(transformResolvedMembers)(
              interaction.data.resolved.members
            ) ?? {},
          roles:
            nullishThrough(transformResolvedRoles)(
              interaction.data.resolved.roles
            ) ?? {},
        },
      },
    };
  }

  if (interaction.data.component_type === ComponentType.ChannelSelect) {
    return {
      type: "messageComponent",
      ...transformers.userInvokedInteractionBase(interaction),
      data: {
        componentType: "channelSelect",
        customId: interaction.data.custom_id,
        values: interaction.data.values,
        resolved: {
          channels:
            nullishThrough(transformResolvedChannels)(
              interaction.data.resolved.channels
            ) ?? {},
        },
      },
    };
  }

  throw new Error("unreachable");
};

const transformApplicationCommandAutocompleteInteraction = (
  interaction: APIApplicationCommandAutocompleteInteraction
): AdaptorApplicationCommandAutoCompleteInteraction => {
  return {
    type: "applicationCommandAutoComplete",
    ...transformers.userInvokedInteractionBase(interaction),
    data: interaction.data,
  };
};

const transformModalSubmitInteraction = (
  interaction: APIModalSubmitInteraction
): AdaptorModalSubmitInteraction => {
  const fields: Record<string, string> = {};

  interaction.data.components.forEach((row) => {
    row.components.forEach((com) => {
      fields[com.custom_id] = com.value;
    });
  });

  return {
    type: "modalSubmit",
    ...transformers.userInvokedInteractionBase(interaction),
    data: {
      customId: interaction.data.custom_id,
      fields: fields,
    },
  };
};

const transformResolvedUsers = (record: Record<Snowflake, APIUser>) => {
  return transformRecordValue(transformers.user)(record);
};

const transformResolvedMembers = (
  record: Record<Snowflake, APIInteractionDataResolvedGuildMember>
) => {
  return transformRecordValue(transformers.partialMember)(record);
};

const transformResolvedRoles = (record: Record<Snowflake, APIRole>) => {
  return transformRecordValue(transformers.role)(record);
};

const transformResolvedChannels = (
  record: Record<Snowflake, APIInteractionDataResolvedChannel>
) => {
  return transformRecordValue(transformers.channel)(record);
};

const transformResolvedAttachments = (
  record: Record<Snowflake, APIAttachment>
) => {
  return transformRecordValue(transformers.attachment)(record);
};

export const transformersInteraction = {
  interaction: transformInteraction,
  interactionBase: transformInteractionBase,
  userInvokedInteractionBase: transformUserInvokedInteractionBase,
  pingInteraction: transformPingInteraction,
  applicationCommandInteraction: transformApplicationCommandInteraction,
  applicationCommandInteractionOption:
    transformApplicationCommandInteractionOption,
  messageComponentInteraction: transformMessageComponentInteraction,
  applicationCommandAutocompleteInteraction:
    transformApplicationCommandAutocompleteInteraction,
  modalSubmitInteraction: transformModalSubmitInteraction,
  resolvedUsers: transformResolvedUsers,
  resolvedMembers: transformResolvedMembers,
  resolvedRoles: transformResolvedRoles,
  resolvedChannels: transformResolvedChannels,
};
