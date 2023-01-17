import type { AdaptorModalActionRowComponent } from "./component";
import type { AdaptorMessagePayload } from "./messagePayload";
import type { SetNullable } from "../../util/types";

/**
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object
 */
export type AdaptorInteractionResponse =
  | AdaptorInteractionResponseReply
  | AdaptorInteractionResponseDeferredReply
  | AdaptorInteractionResponseDeferredUpdate
  | AdaptorInteractionResponseModal;

export const AdaptorInteractionResponseTypeMap = {
  channelMessageWithSource: 4,
  deferredChannelMessageWithSource: 5,
  deferredUpdateMessage: 6,
  modal: 9,
} as const satisfies Record<AdaptorInteractionResponse["type"], number>;

/**
 * Messageとして返信する
 */
export interface AdaptorInteractionResponseReply {
  /**
   * @see AdaptorInteractionResponseTypeMap
   */
  type: "channelMessageWithSource";
  data: AdaptorMessagePayload & {
    ephemeral?: boolean;
  };
}

/**
 * 回答保留する
 * ユーザ側には返答待ち状態である旨が表示される
 */
export interface AdaptorInteractionResponseDeferredReply {
  /**
   * @see AdaptorInteractionResponseTypeMap
   */
  type: "deferredChannelMessageWithSource";
  data?: {
    suppressEmbeds?: boolean;
    ephemeral?: boolean;
  };
}

/**
 * 回答保留する
 * ユーザ側には返答待ち状態である旨が表示されない
 * MessageComponentによるInteractionにのみ使用できる
 */
export interface AdaptorInteractionResponseDeferredUpdate {
  /**
   * @see AdaptorInteractionResponseTypeMap
   */
  type: "deferredUpdateMessage";
}

/**
 * Modalを開く
 */
export interface AdaptorInteractionResponseModal {
  /**
   * @see AdaptorInteractionResponseTypeMap
   */
  type: "modal";
  data: AdaptorInteractionResponseModalData;
}

export interface AdaptorInteractionResponseModalData {
  /**
   * a developer-defined identifier for the component, max 100 characters
   */
  customId: string;

  /**
   * the title of the popup modal, max 45 characters
   */
  title: string;

  /**
   * between 1 and 5 (inclusive) components that make up the modal
   */
  components:
    | [AdaptorModalActionRowComponent]
    | [AdaptorModalActionRowComponent, AdaptorModalActionRowComponent]
    | [
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent
      ]
    | [
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent
      ]
    | [
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent,
        AdaptorModalActionRowComponent
      ];
}

/**
 * @see https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response
 */
export type AdaptorInteractionResponsePatch = Omit<
  SetNullable<
    AdaptorMessagePayload,
    Exclude<keyof AdaptorMessagePayload, "suppressEmbeds" | "ephemeral">
  >,
  "messageReference" | "stickerIds"
>;
