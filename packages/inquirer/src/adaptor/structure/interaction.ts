import type { AdaptorPartialMember } from "./guild";
import type { AdaptorAttachment } from "./index";
import type { AdaptorPermissions } from "./index";
import type { AdaptorPartialChannel, Snowflake } from "./index";
import type { AdaptorRole } from "./permissions";
import type { AdaptorUser } from "./user";

/**
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure
 */
export type AdaptorInteraction =
  | AdaptorPingInteraction
  | AdaptorApplicationCommandInteraction
  | AdaptorMessageComponentInteraction
  | AdaptorApplicationCommandAutoCompleteInteraction
  | AdaptorModalSubmitInteraction;

export type AdaptorMessageComponentInteraction =
  | AdaptorButtonInteraction
  | AdaptorStringSelectInteraction
  | AdaptorUserSelectInteraction
  | AdaptorRoleSelectInteraction
  | AdaptorMentionableSelectInteraction
  | AdaptorChannelSelectInteraction;

export interface AdaptorInteractionBase {
  /**
   * ID of the interaction
   */
  id: Snowflake;

  /**
   * ID of the application this interaction is for
   */
  applicationId: Snowflake;

  /**
   * Continuation token for responding to the interaction
   */
  token: string;

  /**
   * Read-only property, always 1
   */
  version: 1;
}

export interface AdaptorUserInvokedInteractionBase<
  T extends "guild" | "other" = "guild" | "other",
> extends AdaptorInteractionBase {
  /**
   * Guild that the interaction was sent from
   */
  guildId: T extends "guild" ? Snowflake : null;

  /**
   * Channel that the interaction was sent from
   */
  channelId: Snowflake;

  /**
   * Guild member data for the invoking user, including permissions
   */
  member: T extends "guild" ? AdaptorPartialMember : null;

  /**
   * User object for the invoking user
   */
  user: AdaptorUser;

  /**
   * Bitwise set of permissions the app or bot has within the channel the interaction was sent from
   */
  appPermissions: T extends "guild" ? AdaptorPermissions : null;

  /**
   * Selected language of the invoking user
   * @see https://discord.com/developers/docs/reference#locales
   */
  locale: string;

  /**
   * Guild's preferred locale, if invoked in a guild
   * @see https://discord.com/developers/docs/reference#locales
   */
  guildLocale: T extends "guild" ? string : null;
}

export interface AdaptorPingInteraction extends AdaptorInteractionBase {
  type: "ping";
}

export interface AdaptorApplicationCommandInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "applicationCommand";

  data: {
    id: Snowflake;
    name: string;
    type: "chatInput" | "user" | "message";
    resolved: {
      users: Record<Snowflake, AdaptorUser | undefined>;
      members: Record<Snowflake, AdaptorPartialMember | undefined>;
      roles: Record<Snowflake, AdaptorRole | undefined>;
      channels: Record<Snowflake, AdaptorPartialChannel | undefined>;
      attachments: Record<Snowflake, AdaptorAttachment | undefined>;
    };
    options: AdaptorApplicationCommandInteractionOption[];
    guildId: Snowflake | null;
    targetId: Snowflake | null;
  };
}

export type AdaptorApplicationCommandInteractionOption =
  | AdaptorApplicationCommandInteractionOptionSubCommand
  | AdaptorApplicationCommandInteractionOptionSubCommandGroup
  | AdaptorApplicationCommandInteractionOptionString
  | AdaptorApplicationCommandInteractionOptionBoolean
  | AdaptorApplicationCommandInteractionOptionNumber
  | AdaptorApplicationCommandInteractionOptionSnowflake;

export interface AdaptorApplicationCommandInteractionOptionNumber {
  type: "integer" | "number";
  value: number;
}

export interface AdaptorApplicationCommandInteractionOptionString {
  type: "string";
  value: string;
}

export interface AdaptorApplicationCommandInteractionOptionBoolean {
  type: "boolean";
  value: boolean;
}

export interface AdaptorApplicationCommandInteractionOptionSnowflake {
  type: "user" | "channel" | "role" | "mentionable" | "attachment";
  value: Snowflake;
}

export interface AdaptorApplicationCommandInteractionOptionSubCommand {
  type: "subCommand";
  name: string;
  options: Exclude<
    AdaptorApplicationCommandInteractionOption,
    | AdaptorApplicationCommandInteractionOptionSubCommand
    | AdaptorApplicationCommandInteractionOptionSubCommandGroup
  >[];
}

export interface AdaptorApplicationCommandInteractionOptionSubCommandGroup {
  type: "subCommandGroup";
  name: string;
  options: AdaptorApplicationCommandInteractionOptionSubCommand[];
}

export interface AdaptorButtonInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "button";
  };
}

export interface AdaptorStringSelectInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "stringSelect";
    values: string[];
  };
}

export interface AdaptorUserSelectInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "userSelect";
    values: Snowflake[];
    resolved: {
      users: Record<Snowflake, AdaptorUser>;
      members: Record<Snowflake, AdaptorPartialMember>;
    };
  };
}
export interface AdaptorRoleSelectInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "roleSelect";
    values: Snowflake[];
    resolved: {
      roles: Record<Snowflake, AdaptorRole>;
    };
  };
}

export interface AdaptorMentionableSelectInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "mentionableSelect";
    values: Snowflake[];
    resolved: {
      users: Record<Snowflake, AdaptorUser | undefined>;
      members: Record<Snowflake, AdaptorPartialMember | undefined>;
      roles: Record<Snowflake, AdaptorRole | undefined>;
    };
  };
}

export interface AdaptorChannelSelectInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "channelSelect";
    values: Snowflake[];
    resolved: {
      channels: Record<Snowflake, AdaptorPartialChannel>;
    };
  };
}

export interface AdaptorModalSubmitInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "modalSubmit";
  data: {
    customId: string;

    //transformed
    fields: Record<string, string>; //customId, value
  };
}

export const isAdaptorPingInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorPingInteraction => interaction.type === "ping";

export const isAdaptorApplicationCommandInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorApplicationCommandInteraction =>
  interaction.type === "applicationCommand";

export const isAdaptorButtonInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorButtonInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "button";

export const isAdaptorStringSelectInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorStringSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "stringSelect";

export const isAdaptorUserSelectInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorUserSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "userSelect";

export const isAdaptorRoleSelectInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorRoleSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "roleSelect";

export const isAdaptorMentionableSelectInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorMentionableSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "mentionableSelect";

export const isAdaptorChannelSelectInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorChannelSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "channelSelect";

export interface AdaptorApplicationCommandAutoCompleteInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "applicationCommandAutoComplete";
  /**
   * discord-inquire will not use this
   */
  data: unknown;
}

export const isAdaptorApplicationCommandAutoCompleteInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorApplicationCommandAutoCompleteInteraction =>
  interaction.type === "applicationCommandAutoComplete";

export const isAdaptorModalSubmitInteraction = (
  interaction: AdaptorInteraction,
): interaction is AdaptorModalSubmitInteraction =>
  interaction.type === "modalSubmit";
