import type { PartialEmoji } from "./emoji";
import type { Snowflake } from "discord-api-types/v10";
import type { SetRequired } from "type-fest";

/**
 * {@link https://discord.com/developers/docs/topics/gateway-events#message-reaction-add}
 * {@link https://discord.com/developers/docs/topics/gateway-events#message-reaction-remove}
 */
export interface MessageReaction {
  action: "add" | "remove";
  userId: Snowflake;
  channelId: Snowflake;
  messageId: Snowflake;
  guildId?: Snowflake;
  emoji: SetRequired<PartialEmoji, keyof PartialEmoji>;
}
