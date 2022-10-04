import type { SetNullable } from "../../util/types";
import type { ModalActionRowComponent } from "./component";
import type { MessagePayload } from "./messagePayload";

/**
 * {@link https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-response-object }
 */
export type InteractionResponse =
  | InteractionResponseReply
  | InteractionResponseDeferredReply
  | InteractionResponseDeferredUpdate
  | InteractionResponseModal;

/**
 * Messageとして返信する
 */
export interface InteractionResponseReply {
  type: "channelMessageWithSource"; //CHANNEL_MESSAGE_WITH_SOURCE 4
  data: MessagePayload & {
    ephemeral?: boolean;
  };
}

/**
 * 回答保留する
 * ユーザ側には返答待ち状態である旨が表示される
 */
export interface InteractionResponseDeferredReply {
  type: "deferredChannelMessageWithSource"; // 5
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
export interface InteractionResponseDeferredUpdate {
  type: "deferredUpdateMessage"; // 6
}

/**
 * Modalを開く
 */
export interface InteractionResponseModal {
  type: "modal";
  data: {
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
      | [ModalActionRowComponent]
      | [ModalActionRowComponent, ModalActionRowComponent]
      | [
          ModalActionRowComponent,
          ModalActionRowComponent,
          ModalActionRowComponent
        ]
      | [
          ModalActionRowComponent,
          ModalActionRowComponent,
          ModalActionRowComponent,
          ModalActionRowComponent
        ]
      | [
          ModalActionRowComponent,
          ModalActionRowComponent,
          ModalActionRowComponent,
          ModalActionRowComponent,
          ModalActionRowComponent
        ];
  };
}

/**
 * {@link https://discord.com/developers/docs/interactions/receiving-and-responding#edit-original-interaction-response}
 */
export type InteractionResponsePatch = Omit<
  SetNullable<
    MessagePayload,
    Exclude<keyof MessagePayload, "suppressEmbeds" | "ephemeral">
  >,
  "messageReference" | "stickerIds"
>;
