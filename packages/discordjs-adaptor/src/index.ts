import { deleteMessage, editMessage, sendMessage } from "./message";

import type {
  FollowupPayload,
  FollowupPayloadPatch,
  Interaction,
  InteractionResponse,
  InteractionResponsePatch,
  MessagePayload,
  MessagePayloadPatch,
  MessageReaction,
  Snowflake,
} from "discord-inquirer";
import type { DiscordAdaptor } from "discord-inquirer";
import type { BaseMessageOptions } from "discord.js";
import type { Client } from "discord.js";

export interface DiscordJsAdaptor extends DiscordAdaptor {
  sendMessage: (
    channelId: Snowflake,
    payload: MessagePayload & AdditionalMessagePayload
  ) => Promise<Snowflake>;
  editMessage: (
    channelId: Snowflake,
    messageId: Snowflake,
    payload: MessagePayloadPatch & AdditionalMessagePayload
  ) => Promise<Snowflake>;
  sendInteractionResponse: (
    interactionId: Snowflake,
    token: string,
    payload: InteractionResponse & AdditionalMessagePayload
  ) => Promise<void>;
  editInteractionResponse: (
    token: string,
    payload: InteractionResponsePatch & AdditionalMessagePayload
  ) => Promise<Snowflake>;
  sendFollowUp: (
    token: string,
    payload: FollowupPayload & AdditionalMessagePayload
  ) => Promise<Snowflake>;
  editFollowup: (
    messageId: Snowflake,
    token: string,
    payload: FollowupPayloadPatch & AdditionalMessagePayload
  ) => Promise<Snowflake>;
}

export interface AdditionalMessagePayload {
  files?: BaseMessageOptions["files"];
}

export const createDiscordJsAdaptor = (client: Client): DiscordJsAdaptor => {
  return {
    sendMessage: sendMessage(client),
    editMessage: editMessage(client),
    deleteMessage: deleteMessage(client),
  };
};
