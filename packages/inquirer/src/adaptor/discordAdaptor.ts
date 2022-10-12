import type {
  FollowupPayload,
  FollowupPayloadPatch,
  Interaction,
  InteractionResponse,
  InteractionResponsePatch,
  MessagePayload,
  MessagePayloadPatch,
  Snowflake,
} from "./structure";

export interface DiscordAdaptor {
  sendMessage: (
    channelId: Snowflake,
    payload: MessagePayload
  ) => Promise<Snowflake>;
  editMessage: (
    channelId: Snowflake,
    messageId: Snowflake,
    payload: MessagePayloadPatch
  ) => Promise<Snowflake>;
  deleteMessage: (channelId: Snowflake, messageId: Snowflake) => Promise<void>;

  sendInteractionResponse: (
    interactionId: Snowflake,
    token: string,
    payload: InteractionResponse
  ) => Promise<void>;
  getInteractionResponse: (token: string) => Promise<Snowflake>;
  editInteractionResponse: (
    token: string,
    payload: InteractionResponsePatch
  ) => Promise<Snowflake>;
  deleteInteractionResponse: (token: string) => Promise<void>;

  sendFollowUp: (token: string, payload: FollowupPayload) => Promise<Snowflake>;
  editFollowup: (
    messageId: Snowflake,
    token: string,
    payload: FollowupPayloadPatch
  ) => Promise<Snowflake>;
  deleteFollowup: (messageId: Snowflake, token: string) => Promise<void>;

  subscribeInteraction: (
    handleInteraction: (interaction: Interaction) => void
  ) => () => void;
}
