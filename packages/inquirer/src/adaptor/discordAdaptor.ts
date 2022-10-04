import type {
  FollowupPayload,
  FollowupPayloadPatch,
  InteractionResponse,
  InteractionResponsePatch,
  MessagePayload,
  MessagePayloadPatch,
} from "./structure";
import type { Interaction } from "./structure/interaction";
import type { MessageReaction } from "./structure/messageReaction";
import type { Snowflake } from "discord-api-types/v10";

//スレッドの作成はスコープ外

//実際にadaptor実装するときはzodでスキーマ書いて、discordjsのオブジェクトをtoJSON()してぶち込み、該当type以外のをはじきつつtransformしてやると良さそう

interface DiscordAdaptor {
  sendMessage: (
    channelId: Snowflake,
    payload: MessagePayload
  ) => Promise<Snowflake>;
  editMessage: (
    messageId: Snowflake,
    payload: MessagePayloadPatch
  ) => Promise<Snowflake>;
  deleteMessage: (messageId: Snowflake) => Promise<void>;

  sendReply: (
    interactionId: Snowflake,
    token: string,
    payload: InteractionResponse
  ) => Promise<void>;
  getReply: (token: string) => Promise<Snowflake>;
  editReply: (
    token: string,
    payload: InteractionResponsePatch
  ) => Promise<Snowflake>;
  deleteReply: (token: string) => Promise<void>;

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
}
