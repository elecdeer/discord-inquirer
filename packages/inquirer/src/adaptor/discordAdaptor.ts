import type { Emoji } from "./structure/component";
import type {
  FollowupPayload,
  FollowupPayloadPatch,
} from "./structure/followupPayload";
import type { InteractionResponse } from "./structure/interactionResponse";
import type {
  MessagePayload,
  MessagePayloadPatch,
} from "./structure/messagePayload";
import type { Snowflake } from "discord-api-types/v10";

type InteractionResponsePatch = MessagePayloadPatch;

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

  /**
   * Messageとして返す
   * reply()
   */
  sendReply: (
    interactionId: Snowflake,
    token: string,
    payload: InteractionResponse
  ) => Promise<void>;

  //interactionへの返答はmessageIdとかを返さないのでこれが必要かも
  getReply: (token: string) => Promise<Snowflake>;

  editReply: (
    token: string,
    payload: InteractionResponsePatch
  ) => Promise<Snowflake>;

  deleteReply: (token: string) => Promise<void>;

  /**
   * 追加回答や回答保留していた返答を送る
   * followup
   */
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

type Interaction =
  | InteractionButton
  | InteractionSelect
  | InteractionModalSubmit;

type InteractionBase = {
  id: Snowflake;
  token: string;
  userId: Snowflake;
  guildId?: Snowflake;
  channelId?: Snowflake;
};

type InteractionButton = InteractionBase & {
  type: 3; //MESSAGE_COMPONENT
  data: {
    customId: string;
    componentType: 2; //Button
  };
};

type InteractionSelect = InteractionBase & {
  type: 3; //MESSAGE_COMPONENT
  data: {
    customId: string;
    componentType: 3; //	Select Menu
    values: string[];
  };
};

type InteractionModalSubmit = InteractionBase & {
  type: 5; //MODAL_SUBMIT
  data: {
    customId: string;

    //transformed
    fields: Record<string, string>; //customId, value
  };
};

type MessageReaction = {
  action: "add" | "remove";
  userId: Snowflake;
  channelId: Snowflake;
  messageId: Snowflake;
  guildId?: Snowflake;
  emoji: Emoji;
};
