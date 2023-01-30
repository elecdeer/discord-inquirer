import { apiFetcher } from "./fetcher";
import { deleteFollowup, editFollowup, sendFollowUp } from "./followup";
import {
  createInteractionAdaptor,
  deleteInteractionResponse,
  editInteractionResponse,
  getInteractionResponse,
} from "./interactionResponse";
import { deleteMessage, editMessage, sendMessage } from "./message";

import type { DiscordAdaptor } from "discord-inquirer";

export const createNodeAdaptor = (options: {
  clientPublicKey: string;
  applicationId: string;
  botToken: string;
  port: number;
  apiRoute?: string;
}): DiscordAdaptor => {
  const { sendInteractionResponse, subscribeInteraction } =
    createInteractionAdaptor({
      discordPublicKey: options.clientPublicKey,
      port: options.port,
    });

  const fetcher = apiFetcher(
    options.apiRoute ?? "https://discord.com/api/v10",
    options.botToken
  );

  return {
    sendMessage: sendMessage(fetcher),
    editMessage: editMessage(fetcher),
    deleteMessage: deleteMessage(fetcher),
    sendInteractionResponse: sendInteractionResponse,
    getInteractionResponse: getInteractionResponse(
      fetcher,
      options.applicationId
    ),
    editInteractionResponse: editInteractionResponse(
      fetcher,
      options.applicationId
    ),
    deleteInteractionResponse: deleteInteractionResponse(
      fetcher,
      options.applicationId
    ),
    sendFollowUp: sendFollowUp(fetcher, options.applicationId),
    editFollowup: editFollowup(fetcher, options.applicationId),
    deleteFollowup: deleteFollowup(fetcher, options.applicationId),
    subscribeInteraction: subscribeInteraction,
  };
};
