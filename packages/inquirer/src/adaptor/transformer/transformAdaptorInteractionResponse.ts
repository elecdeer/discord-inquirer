import { InteractionResponseType } from "discord-api-types/v10";

import { transformers } from "./index";

import type {
  AdaptorInteractionResponse,
  AdaptorInteractionResponseDeferredReply,
  AdaptorInteractionResponseDeferredUpdate,
  AdaptorInteractionResponseModal,
  AdaptorInteractionResponsePatch,
  AdaptorInteractionResponseReply,
} from "../structure";
import type {
  APIInteractionResponse,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseDeferredChannelMessageWithSource,
  APIInteractionResponseDeferredMessageUpdate,
  APIModalInteractionResponse,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types/v10";

export const transformAdaptorInteractionResponse = (
  res: AdaptorInteractionResponse,
): APIInteractionResponse => {
  switch (res.type) {
    case "channelMessageWithSource":
      return transformers.adaptorInteractionResponseReply(res);
    case "deferredChannelMessageWithSource":
      return transformers.adaptorInteractionResponseDeferredReply(res);
    case "deferredUpdateMessage":
      return transformers.adaptorInteractionResponseDeferredUpdate(res);
    case "modal":
      return transformers.adaptorInteractionResponseModal(res);
  }
};

export const transformAdaptorInteractionResponseReply = (
  res: AdaptorInteractionResponseReply,
): APIInteractionResponseChannelMessageWithSource => ({
  type: InteractionResponseType.ChannelMessageWithSource,
  data: transformers.adaptorMessagePayload(res.data),
});

export const transformAdaptorInteractionResponseDeferredReply = (
  res: AdaptorInteractionResponseDeferredReply,
): APIInteractionResponseDeferredChannelMessageWithSource => ({
  type: InteractionResponseType.DeferredChannelMessageWithSource,
  data: res.data && transformers.adaptorMessagePayload(res.data),
});

export const transformAdaptorInteractionResponseDeferredUpdate = (
  _: AdaptorInteractionResponseDeferredUpdate,
): APIInteractionResponseDeferredMessageUpdate => ({
  type: InteractionResponseType.DeferredMessageUpdate,
});

const transformAdaptorInteractionResponseModal = (
  res: AdaptorInteractionResponseModal,
): APIModalInteractionResponse => {
  return {
    type: InteractionResponseType.Modal,
    data: {
      custom_id: res.data.customId,
      title: res.data.title,
      components: res.data.components.map(
        transformers.adaptorModalActionRowComponent,
      ),
    },
  };
};

const transformAdaptorInteractionResponsePatch = (
  res: AdaptorInteractionResponsePatch,
): RESTPatchAPIInteractionOriginalResponseJSONBody => {
  return transformers.adaptorMessagePayloadPatch(res);
};

export const transformersAdaptorInteractionResponse = {
  adaptorInteractionResponse: transformAdaptorInteractionResponse,
  adaptorInteractionResponseReply: transformAdaptorInteractionResponseReply,
  adaptorInteractionResponseDeferredReply:
    transformAdaptorInteractionResponseDeferredReply,
  adaptorInteractionResponseDeferredUpdate:
    transformAdaptorInteractionResponseDeferredUpdate,
  adaptorInteractionResponseModal: transformAdaptorInteractionResponseModal,
  adaptorInteractionResponsePatch: transformAdaptorInteractionResponsePatch,
};
