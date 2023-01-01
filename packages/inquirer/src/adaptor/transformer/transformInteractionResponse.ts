import { InteractionResponseType } from "discord-api-types/v10";

import { transformModalActionRowComponent } from "./transformComponent";
import {
  transformMessagePayload,
  transformMessagePayloadPatch,
} from "./transformMessagePayload";

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

export const transformInteractionResponse = (
  res: AdaptorInteractionResponse
): APIInteractionResponse => {
  switch (res.type) {
    case "channelMessageWithSource":
      return transformInteractionResponseReply(res);
    case "deferredChannelMessageWithSource":
      return transformInteractionResponseDeferredReply(res);
    case "deferredUpdateMessage":
      return transformInteractionResponseDeferredUpdate(res);
    case "modal":
      return transformInteractionResponseModal(res);
  }
};

export const transformInteractionResponseReply = (
  res: AdaptorInteractionResponseReply
): APIInteractionResponseChannelMessageWithSource => ({
  type: InteractionResponseType.ChannelMessageWithSource,
  data: transformMessagePayload(res.data),
});

export const transformInteractionResponseDeferredReply = (
  res: AdaptorInteractionResponseDeferredReply
): APIInteractionResponseDeferredChannelMessageWithSource => ({
  type: InteractionResponseType.DeferredChannelMessageWithSource,
  data: res.data && transformMessagePayload(res.data),
});

export const transformInteractionResponseDeferredUpdate = (
  _: AdaptorInteractionResponseDeferredUpdate
): APIInteractionResponseDeferredMessageUpdate => ({
  type: InteractionResponseType.DeferredMessageUpdate,
});

export const transformInteractionResponseModal = (
  res: AdaptorInteractionResponseModal
): APIModalInteractionResponse => {
  return {
    type: InteractionResponseType.Modal,
    data: {
      custom_id: res.data.customId,
      title: res.data.title,
      components: res.data.components.map(transformModalActionRowComponent),
    },
  };
};

export const transformInteractionResponsePatch = (
  res: AdaptorInteractionResponsePatch
): RESTPatchAPIInteractionOriginalResponseJSONBody => {
  return transformMessagePayloadPatch(res);
};
