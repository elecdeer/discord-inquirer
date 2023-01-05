import { ComponentType, InteractionType } from "discord-api-types/v10";
import assert from "node:assert";

import { transformers } from "./index";
import { nullishThrough, transformRecordValue } from "./shared";

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
import type { ReadonlyDeep } from "type-fest";

const transformInteraction = (
  interaction: APIInteraction
): ReadonlyDeep<AdaptorInteraction> => {
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
): ReadonlyDeep<AdaptorInteractionBase> => {
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
): ReadonlyDeep<AdaptorUserInvokedInteractionBase> => {
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
): ReadonlyDeep<AdaptorPingInteraction> => {
  return {
    type: "ping",
    ...transformers.interactionBase(interaction),
  };
};

const transformApplicationCommandInteraction = (
  interaction: APIApplicationCommandInteraction
): ReadonlyDeep<AdaptorApplicationCommandInteraction> => {
  return {
    type: "applicationCommand",
    ...transformers.userInvokedInteractionBase(interaction),
    data: interaction.data,
  };
};

const transformMessageComponentInteraction = (
  interaction: APIMessageComponentInteraction
): ReadonlyDeep<AdaptorInteraction> => {
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
): ReadonlyDeep<AdaptorApplicationCommandAutoCompleteInteraction> => {
  return {
    type: "applicationCommandAutoComplete",
    ...transformers.userInvokedInteractionBase(interaction),
    data: interaction.data,
  };
};

const transformModalSubmitInteraction = (
  interaction: APIModalSubmitInteraction
): ReadonlyDeep<AdaptorModalSubmitInteraction> => {
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

const transformResolvedUsers: (
  record: Record<Snowflake, APIUser>
) => Record<Snowflake, AdaptorUser> = transformRecordValue<
  Snowflake,
  APIUser,
  AdaptorUser
>(transformers.user);

const transformResolvedMembers: (
  record: Record<Snowflake, APIInteractionDataResolvedGuildMember>
) => Record<Snowflake, AdaptorPartialMember> = transformRecordValue<
  Snowflake,
  APIInteractionDataResolvedGuildMember,
  AdaptorPartialMember
>(transformers.partialMember);

const transformResolvedRoles: (
  record: Record<Snowflake, APIRole>
) => Record<Snowflake, AdaptorRole> = transformRecordValue<
  Snowflake,
  APIRole,
  AdaptorRole
>(transformers.role);

const transformResolvedChannels: (
  record: Record<Snowflake, APIInteractionDataResolvedChannel>
) => Record<Snowflake, AdaptorPartialChannel> = transformRecordValue<
  Snowflake,
  APIInteractionDataResolvedChannel,
  AdaptorPartialChannel
>(transformers.channel);

export const transformersInteraction = {
  interaction: transformInteraction,
  interactionBase: transformInteractionBase,
  userInvokedInteractionBase: transformUserInvokedInteractionBase,
  pingInteraction: transformPingInteraction,
  applicationCommandInteraction: transformApplicationCommandInteraction,
  messageComponentInteraction: transformMessageComponentInteraction,
  applicationCommandAutocompleteInteraction:
    transformApplicationCommandAutocompleteInteraction,
  modalSubmitInteraction: transformModalSubmitInteraction,
  resolvedUsers: transformResolvedUsers,
  resolvedMembers: transformResolvedMembers,
  resolvedRoles: transformResolvedRoles,
  resolvedChannels: transformResolvedChannels,
};
