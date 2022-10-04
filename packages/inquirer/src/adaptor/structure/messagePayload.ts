import type { SetNullable } from "../../util/types";
import type { MessageActionRowComponent } from "./component";
import type { Embed } from "./embed";

type Snowflake = string;

/**
 * {@link https://discord.com/developers/docs/resources/channel#create-message-jsonform-params}
 */
export interface MessagePayload {
  /**
   * Message contents (up to 2000 characters)
   * メッセージの平文テキスト (最大 2000 文字)
   */
  content?: string;

  /**
   * Embedded rich content (up to 6000 characters)
   * 埋め込みコンテンツ (最大 6000 文字)
   */
  embeds?: Embed[];

  /**
   * Allowed mentions for the message
   * このメッセージに含めることができるメンション
   *
   * correspond to parameter allowed_mentions
   */
  allowedMentions?: AllowedMentions;

  /**
   * Include to make your message a reply
   * リプライ先のメッセージ
   *
   * correspond to message_reference
   */
  messageReference?: MessageReference;

  /**
   * Components to include with the message
   * メッセージに含めるコンポーネント
   */
  components?: MessageActionRowComponent[];

  /**
   * IDs of up to 3 stickers in the server to send in the message
   * メッセージに含めるスタンプのSnowflakeId (最大 3 つ)
   */
  stickerIds?:
    | [Snowflake]
    | [Snowflake, Snowflake]
    | [Snowflake, Snowflake, Snowflake];

  /**
   * do not include any embeds when serializing this message
   * trueにするとEmbedsを展開しなくなる
   *
   * correspond to flag 1<<2
   */
  suppressEmbeds?: boolean;
}

/**
 * {@link https://discord.com/developers/docs/resources/channel#edit-message-jsonform-params}
 */
export type MessagePayloadPatch = Omit<
  SetNullable<MessagePayload, Exclude<keyof MessagePayload, "suppressEmbeds">>,
  "messageReference" | "stickerIds"
>;

/**
 * {@link https://discord.com/developers/docs/resources/channel#allowed-mentions-object}
 */
export type AllowedMentions = {
  /**
   * `@everyone` へのメンションを許可するかどうか
   * @default false
   */
  everyone?: boolean;

  /**
   * ロールメンションを許可するかどうか
   * @default false
   */
  roles?: boolean | Snowflake[];

  /**
   * ユーザーメンションを許可するかどうか
   * @default false
   */
  users?: boolean | Snowflake[];

  /**
   * リプライ先のユーザーへのメンションを許可するかどうか
   * @default false
   */
  repliedUser?: boolean;
};

/**
 * {@link https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure}
 */
export type MessageReference = {
  /**
   * id of the originating
   * リプライ先のメッセージのSnowflakeId
   */
  messageId: Snowflake;

  /**
   * when sending, whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message, default true
   * リプライ先のメッセージが存在しない場合にエラーを返すかどうか
   * @default true
   */
  failIfNotExists?: boolean;
};
