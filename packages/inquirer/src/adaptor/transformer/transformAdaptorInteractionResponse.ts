import { InteractionResponseType } from "discord-api-types/v10";

import { transformAdaptorModalActionRowComponent } from "./transformAdaptorComponent";
import {
  transformAdaptorMessagePayload,
  transformAdaptorMessagePayloadPatch,
} from "./transformAdaptorMessagePayload";

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
  res: AdaptorInteractionResponse
): APIInteractionResponse => {
  switch (res.type) {
    case "channelMessageWithSource":
      return transformAdaptorInteractionResponseReply(res);
    case "deferredChannelMessageWithSource":
      return transformAdaptorInteractionResponseDeferredReply(res);
    case "deferredUpdateMessage":
      return transformAdaptorInteractionResponseDeferredUpdate(res);
    case "modal":
      return transformAdaptorInteractionResponseModal(res);
  }
};

export const transformAdaptorInteractionResponseReply = (
  res: AdaptorInteractionResponseReply
): APIInteractionResponseChannelMessageWithSource => ({
  type: InteractionResponseType.ChannelMessageWithSource,
  data: transformAdaptorMessagePayload(res.data),
});

export const transformAdaptorInteractionResponseDeferredReply = (
  res: AdaptorInteractionResponseDeferredReply
): APIInteractionResponseDeferredChannelMessageWithSource => ({
  type: InteractionResponseType.DeferredChannelMessageWithSource,
  data: res.data && transformAdaptorMessagePayload(res.data),
});

export const transformAdaptorInteractionResponseDeferredUpdate = (
  _: AdaptorInteractionResponseDeferredUpdate
): APIInteractionResponseDeferredMessageUpdate => ({
  type: InteractionResponseType.DeferredMessageUpdate,
});

export const transformAdaptorInteractionResponseModal = (
  res: AdaptorInteractionResponseModal
): APIModalInteractionResponse => {
  return {
    type: InteractionResponseType.Modal,
    data: {
      custom_id: res.data.customId,
      title: res.data.title,
      components: res.data.components.map(
        transformAdaptorModalActionRowComponent
      ),
    },
  };
};

export const transformAdaptorInteractionResponsePatch = (
  res: AdaptorInteractionResponsePatch
): RESTPatchAPIInteractionOriginalResponseJSONBody => {
  return transformAdaptorMessagePayloadPatch(res);
};
