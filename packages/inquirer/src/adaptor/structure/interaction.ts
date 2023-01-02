import type { AdaptorPartialMember } from "./guild";
import type { AdaptorPartialChannel, Snowflake } from "./index";
import type { AdaptorRole } from "./permissions";
import type { AdaptorUser } from "./user";

/**
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure
 */
export type AdaptorInteraction =
  | AdaptorInteractionButton
  | AdaptorInteractionStringSelect
  | AdaptorInteractionUserSelect
  | AdaptorInteractionRoleSelect
  | AdaptorInteractionMentionableSelect
  | AdaptorInteractionChannelSelect
  | AdaptorInteractionModalSubmit;

export interface AdaptorInteractionBase {
  id: Snowflake;
  token: string;
  userId: Snowflake;
  guildId?: Snowflake;
  channelId?: Snowflake;
}

export interface AdaptorInteractionButton extends AdaptorInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "button";
  };
}

export interface AdaptorInteractionStringSelect extends AdaptorInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "stringSelect";
    values: string[];
  };
}

export interface AdaptorInteractionUserSelect extends AdaptorInteractionBase {
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

export interface AdaptorInteractionRoleSelect extends AdaptorInteractionBase {
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

export interface AdaptorInteractionMentionableSelect
  extends AdaptorInteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "mentionableSelect";
    values: Snowflake[];
    resolved: {
      users: Record<Snowflake, AdaptorUser>;
      members: Record<Snowflake, AdaptorPartialMember>;
      roles: Record<Snowflake, AdaptorRole>;
    };
  };
}

export interface AdaptorInteractionChannelSelect
  extends AdaptorInteractionBase {
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

export interface AdaptorInteractionModalSubmit extends AdaptorInteractionBase {
  type: "modalSubmit";
  data: {
    customId: string;

    //transformed
    fields: Record<string, string>; //customId, value
  };
}
