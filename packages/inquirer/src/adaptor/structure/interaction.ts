import type { Snowflake } from "discord-api-types/v10";

/**
 * {@link https://discord.com/developers/docs/interactions/slash-commands#interaction}
 */
export type Interaction =
  | InteractionButton
  | InteractionSelect
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

export interface InteractionSelect extends InteractionBase {
  type: "messageComponent";
  data: {
    customId: string;
    componentType: "selectMenu";
    values: string[];
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
