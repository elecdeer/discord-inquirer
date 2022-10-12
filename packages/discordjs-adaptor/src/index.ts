import { deleteFollowUp, editFollowUp, sendFollowUp } from "./followup";
import {
  deleteInteractionResponse,
  editInteractionResponse,
  getInteractionResponse,
  sendInteractionResponse,
} from "./interactionResponse";
import { deleteMessage, editMessage, sendMessage } from "./message";
import { subscribeInteraction } from "./subscribe";

import type { DiscordAdaptor } from "discord-inquirer";
import type { Client } from "discord.js";

export const createDiscordJsAdaptor = (
  client: Client<true>
): DiscordAdaptor => {
  // interactionCreateイベントをフックしてInteractionオブジェクトをため込み、それに対して操作するようにした方が良いかもしれない
  // そうするとfileなどの対応が楽になる

  return {
    sendMessage: sendMessage(client),
    editMessage: editMessage(client),
    deleteMessage: deleteMessage(client),
    sendInteractionResponse: sendInteractionResponse(client),
    getInteractionResponse: getInteractionResponse(client),
    editInteractionResponse: editInteractionResponse(client),
    deleteInteractionResponse: deleteInteractionResponse(client),
    sendFollowUp: sendFollowUp(client),
    editFollowup: editFollowUp(client),
    deleteFollowup: deleteFollowUp(client),
    subscribeInteraction: subscribeInteraction(client),
  };
};
