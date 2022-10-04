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
} from "./structure";

//スレッドの作成はスコープ外

//実際にadaptor実装するときはzodでスキーマ書いて、discordjsのオブジェクトをtoJSON()してぶち込み、該当type以外のをはじきつつtransformしてやると良さそう

export interface DiscordAdaptor {
  sendMessage: (
    channelId: Snowflake,
    payload: MessagePayload
  ) => Promise<Snowflake>;
  editMessage: (
    messageId: Snowflake,
    payload: MessagePayloadPatch
  ) => Promise<Snowflake>;
  deleteMessage: (messageId: Snowflake) => Promise<void>;

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

  subscribeMessageReaction: (
    handleReaction: (reaction: MessageReaction) => void
  ) => () => void;

  //messageDeleteもいるかも
}
