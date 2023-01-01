import type { PartialMember } from "./guild";
import type { PartialChannel, PartialChannelBase, Snowflake } from "./index";
import type { Role } from "./permissions";
import type { User } from "./user";

/**
 * {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object-interaction-structure }
 */
export type Interaction =
  | InteractionButton
  | InteractionStringSelect
  | InteractionModalSubmit;

export interface InteractionBase {
  id: Snowflake;
  token: string;
  userId: Snowflake;
  guildId?: Snowflake;
  channelId?: Snowflake;
}

export interface InteractionButton extends InteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "button";
  };
}

export interface InteractionStringSelect extends InteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "stringSelect";
    values: string[];
  };
}

export interface InteractionUserSelect extends InteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "userSelect";
    values: Snowflake[];
    resolved: {
      users: Record<Snowflake, User>;
      members: Record<Snowflake, PartialMember>;
    };
  };
}

export interface InteractionRoleSelect extends InteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "roleSelect";
    values: Snowflake[];
    resolved: {
      roles: Record<Snowflake, Role>;
    };
  };
}

export interface InteractionMentionableSelect extends InteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "mentionableSelect";
    values: Snowflake[];
    resolved: {
      users: Record<Snowflake, User>;
      members: Record<Snowflake, PartialMember>;
      roles: Record<Snowflake, Role>;
    };
  };
}

export interface InteractionChannelSelect extends InteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "channelSelect";
    values: Snowflake[];
    resolved: {
      channels: Record<Snowflake, PartialChannel>;
    };
  };
}

export interface InteractionModalSubmit extends InteractionBase {
  type: "modalSubmit";
  data: {
    customId: string;

    //transformed
    fields: Record<string, string>; //customId, value
  };
}
