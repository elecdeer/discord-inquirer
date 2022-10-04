import { InteractionResponseType } from "discord-api-types/v10";

import { transformModalActionRowComponent } from "./transformComponent";
import {
  transformMessagePayload,
  transformMessagePayloadPatch,
} from "./transformMessagePayload";

import type {
  InteractionResponse,
  InteractionResponseDeferredReply,
  InteractionResponseDeferredUpdate,
  InteractionResponseModal,
  InteractionResponsePatch,
  InteractionResponseReply,
} from "../structure";
import type {
  APIInteractionResponse,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseDeferredChannelMessageWithSource,
  APIModalInteractionResponse,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
  APIInteractionResponseDeferredMessageUpdate,
} from "discord-api-types/v10";

export const transformInteractionResponse = (
  res: InteractionResponse
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
  res: InteractionResponseReply
): APIInteractionResponseChannelMessageWithSource => ({
  type: InteractionResponseType.ChannelMessageWithSource,
  data: transformMessagePayload(res.data),
});

export const transformInteractionResponseDeferredReply = (
  res: InteractionResponseDeferredReply
): APIInteractionResponseDeferredChannelMessageWithSource => ({
  type: InteractionResponseType.DeferredChannelMessageWithSource,
  data: res.data && transformMessagePayload(res.data),
});

export const transformInteractionResponseDeferredUpdate = (
  _: InteractionResponseDeferredUpdate
): APIInteractionResponseDeferredMessageUpdate => ({
  type: InteractionResponseType.DeferredMessageUpdate,
});

export const transformInteractionResponseModal = (
  res: InteractionResponseModal
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
  res: InteractionResponsePatch
): RESTPatchAPIInteractionOriginalResponseJSONBody => {
  return transformMessagePayloadPatch(res);
};
