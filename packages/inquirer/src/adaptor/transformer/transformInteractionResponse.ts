import { InteractionResponseType } from "discord-api-types/v10";

import {
  transformMessagePayload,
  transformMessagePayloadPatch,
} from "./transformMessagePayload";

import type {
  InteractionResponseDeferredUpdate,
  InteractionResponsePatch,
} from "../structure/interactionResponse";
import type {
  InteractionResponseDeferredReply,
  InteractionResponseReply,
} from "../structure/interactionResponse";
import type { InteractionResponse } from "../structure/interactionResponse";
import type {
  APIInteractionResponse,
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponseDeferredChannelMessageWithSource,
  RESTPatchAPIInteractionOriginalResponseJSONBody,
} from "discord-api-types/v10";

export const transformInteractionResponse = (
  res: InteractionResponse
): APIInteractionResponse => {
  switch (res.type) {
    case "channelMessageWithSource":
      return transformInteractionResponseReply(res);
    case "deferredChannelMessageWithSource":
      return transformInteractionResponseDeferredReply(res);
    case "deferredMessageUpdate":
      return transformInteractionResponseDeferredUpdate(res);
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
): APIInteractionResponse => ({
  type: InteractionResponseType.DeferredMessageUpdate,
});

export const transformInteractionResponsePatch = (
  res: InteractionResponsePatch
): RESTPatchAPIInteractionOriginalResponseJSONBody => {
  return transformMessagePayloadPatch(res);
};
