import type {
  AdaptorFollowupPayload,
  AdaptorFollowupPayloadPatch,
  AdaptorInteraction,
  AdaptorInteractionResponse,
  AdaptorInteractionResponsePatch,
  AdaptorMessagePayload,
  AdaptorMessagePayloadPatch,
  Snowflake,
} from "./structure";

export interface DiscordAdaptor {
  sendMessage: (
    channelId: Snowflake,
    payload: AdaptorMessagePayload
  ) => Promise<Snowflake>;
  editMessage: (
    channelId: Snowflake,
    messageId: Snowflake,
    payload: AdaptorMessagePayloadPatch
  ) => Promise<Snowflake>;
  deleteMessage: (channelId: Snowflake, messageId: Snowflake) => Promise<void>;

  sendInteractionResponse: (
    interactionId: Snowflake,
    token: string,
    payload: AdaptorInteractionResponse
  ) => Promise<void>;
  getInteractionResponse: (token: string) => Promise<Snowflake>;
  editInteractionResponse: (
    token: string,
    payload: AdaptorInteractionResponsePatch
  ) => Promise<Snowflake>;
  deleteInteractionResponse: (token: string) => Promise<void>;

  sendFollowUp: (
    token: string,
    payload: AdaptorFollowupPayload
  ) => Promise<Snowflake>;
  editFollowup: (
    messageId: Snowflake,
    token: string,
    payload: AdaptorFollowupPayloadPatch
  ) => Promise<Snowflake>;
  deleteFollowup: (messageId: Snowflake, token: string) => Promise<void>;

  subscribeInteraction: (
    handleInteraction: (interaction: AdaptorInteraction) => void
  ) => () => void;
}
