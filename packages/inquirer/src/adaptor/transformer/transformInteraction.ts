import { ComponentType, InteractionType } from "discord-api-types/v10";
import assert from "node:assert";

import { nullishThrough, transformRecordValue } from "./shared";
import { transformChannel } from "./transformChannel";
import { transformPartialMember } from "./transformMember";
import { transformPermissionFlags, transformRole } from "./transformPermission";
import { transformUser } from "./transformUser";

import type {
  AdaptorApplicationCommandAutoCompleteInteraction,
  AdaptorApplicationCommandInteraction,
  AdaptorInteraction,
  AdaptorInteractionBase,
  AdaptorModalSubmitInteraction,
  AdaptorPartialChannel,
  AdaptorPartialMember,
  AdaptorPingInteraction,
  AdaptorRole,
  AdaptorUser,
  AdaptorUserInvokedInteractionBase,
  Snowflake,
} from "../structure";
import type {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandInteraction,
  APIInteraction,
  APIInteractionDataResolvedChannel,
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  APIPingInteraction,
  APIRole,
  APIUser,
  APIInteractionDataResolvedGuildMember,
} from "discord-api-types/v10";

export const transformInteraction = (
  interaction: APIInteraction
): AdaptorInteraction => {
  switch (interaction.type) {
    case InteractionType.Ping:
      return transformPingInteraction(interaction);
    case InteractionType.ApplicationCommand:
      return transformApplicationCommandInteraction(interaction);
    case InteractionType.MessageComponent:
      return transformMessageComponentInteraction(interaction);
    case InteractionType.ApplicationCommandAutocomplete:
      return transformApplicationCommandAutocompleteInteraction(interaction);
    case InteractionType.ModalSubmit:
      return transformModalSubmitInteraction(interaction);
  }
};

export const transformInteractionBase = (
  interaction: APIInteraction
): AdaptorInteractionBase => {
  return {
    id: interaction.id,
    applicationId: interaction.application_id,
    token: interaction.token,
    version: interaction.version,
  };
};

export const transformUserInvokedInteractionBase = (
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
    ...transformInteractionBase(interaction),
    guildId: interaction.guild_id ?? null,
    channelId: interaction.channel_id,
    member: nullishThrough(transformPartialMember)(interaction.member) ?? null,
    user: transformUser(apiUser),
    appPermissions:
      nullishThrough(transformPermissionFlags)(interaction.app_permissions) ??
      null,
    locale: interaction.locale ?? null,
    guildLocale: interaction.guild_locale ?? null,
  };
};

export const transformPingInteraction = (
  interaction: APIPingInteraction
): AdaptorPingInteraction => {
  return {
    type: "ping",
    ...transformInteractionBase(interaction),
  };
};

export const transformApplicationCommandInteraction = (
  interaction: APIApplicationCommandInteraction
): AdaptorApplicationCommandInteraction => {
  return {
    type: "applicationCommand",
    ...transformUserInvokedInteractionBase(interaction),
    data: interaction.data,
  };
};

export const transformMessageComponentInteraction = (
  interaction: APIMessageComponentInteraction
): AdaptorInteraction => {
  const base = {
    ...transformUserInvokedInteractionBase(interaction),
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
      ...transformUserInvokedInteractionBase(interaction),
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
      ...transformUserInvokedInteractionBase(interaction),
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
      ...transformUserInvokedInteractionBase(interaction),
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
      ...transformUserInvokedInteractionBase(interaction),
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

export const transformApplicationCommandAutocompleteInteraction = (
  interaction: APIApplicationCommandAutocompleteInteraction
): AdaptorApplicationCommandAutoCompleteInteraction => {
  return {
    type: "applicationCommandAutoComplete",
    ...transformUserInvokedInteractionBase(interaction),
    data: interaction.data,
  };
};

export const transformModalSubmitInteraction = (
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
    ...transformUserInvokedInteractionBase(interaction),
    data: {
      customId: interaction.data.custom_id,
      fields: fields,
    },
  };
};

export const transformResolvedUsers = transformRecordValue<
  Snowflake,
  APIUser,
  AdaptorUser
>(transformUser);

export const transformResolvedMembers = transformRecordValue<
  Snowflake,
  APIInteractionDataResolvedGuildMember,
  AdaptorPartialMember
>(transformPartialMember);

export const transformResolvedRoles = transformRecordValue<
  Snowflake,
  APIRole,
  AdaptorRole
>(transformRole);

export const transformResolvedChannels = transformRecordValue<
  Snowflake,
  APIInteractionDataResolvedChannel,
  AdaptorPartialChannel
>(transformChannel);
