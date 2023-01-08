import type { AdaptorPartialMember } from "./guild";
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
  T extends "guild" | "other" = "guild" | "other"
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
  /**
   * discord-inquire will not use this
   */
  data: unknown;
}

export interface AdaptorButtonInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "button";
  };
}

export const isAdaptorButtonInteraction = (
  interaction: AdaptorInteraction
): interaction is AdaptorButtonInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "button";

export interface AdaptorStringSelectInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "stringSelect";
    values: string[];
  };
}

export const isAdaptorStringSelectInteraction = (
  interaction: AdaptorInteraction
): interaction is AdaptorStringSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "stringSelect";

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

export const isAdaptorUserSelectInteraction = (
  interaction: AdaptorInteraction
): interaction is AdaptorUserSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "userSelect";

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

export const isAdaptorRoleSelectInteraction = (
  interaction: AdaptorInteraction
): interaction is AdaptorRoleSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "roleSelect";

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

export const isAdaptorMentionableSelectInteraction = (
  interaction: AdaptorInteraction
): interaction is AdaptorMentionableSelectInteraction =>
  interaction.type === "messageComponent" &&
  interaction.data.componentType === "mentionableSelect";

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

export const isAdaptorChannelSelectInteraction = (
  interaction: AdaptorInteraction
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

export interface AdaptorModalSubmitInteraction
  extends AdaptorUserInvokedInteractionBase {
  type: "modalSubmit";
  data: {
    customId: string;

    //transformed
    fields: Record<string, string>; //customId, value
  };
}
