import type { SetNullable } from "../../util/types";
import type { AdaptorMessageActionRowComponent } from "./component";
import type { AdaptorEmbed } from "./embed";

type Snowflake = string;

/**
 * @see https://discord.com/developers/docs/resources/channel#create-message-jsonform-params
 */
export interface AdaptorMessagePayload {
  /**
   * Message contents (up to 2000 characters)
   * メッセージの平文テキスト (最大 2000 文字)
   */
  content?: string;

  /**
   * Embedded rich content (up to 6000 characters)
   * 埋め込みコンテンツ (最大 6000 文字)
   */
  embeds?: AdaptorEmbed[];

  /**
   * Allowed mentions for the message
   * このメッセージに含めることができるメンション
   *
   * correspond to parameter allowed_mentions
   */
  allowedMentions?: AdaptorAllowedMentions;

  /**
   * Include to make your message a reply
   * リプライ先のメッセージ
   *
   * correspond to message_reference
   */
  messageReference?: AdaptorMessageReference;

  /**
   * Components to include with the message
   * メッセージに含めるコンポーネント
   */
  components?: AdaptorMessageActionRowComponent[];

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
 * @see https://discord.com/developers/docs/resources/channel#edit-message-jsonform-params
 */
export type AdaptorMessagePayloadPatch = Omit<
  SetNullable<
    AdaptorMessagePayload,
    Exclude<keyof AdaptorMessagePayload, "suppressEmbeds">
  >,
  "messageReference" | "stickerIds"
>;

/**
 * @see https://discord.com/developers/docs/resources/channel#allowed-mentions-object
 */
export type AdaptorAllowedMentions = {
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
 * @see https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure
 */
export type AdaptorMessageReference = {
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
