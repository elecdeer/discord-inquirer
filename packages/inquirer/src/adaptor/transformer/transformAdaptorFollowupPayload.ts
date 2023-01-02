import {
  transformAdaptorMessagePayload,
  transformAdaptorMessagePayloadPatch,
} from "./transformAdaptorMessagePayload";

import type {
  AdaptorFollowupPayload,
  AdaptorFollowupPayloadPatch,
} from "../structure";
import type {
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupJSONBody,
} from "discord-api-types/v10";

export const transformAdaptorFollowupPayload = (
  payload: AdaptorFollowupPayload
): RESTPostAPIInteractionFollowupJSONBody => {
  return transformAdaptorMessagePayload(payload);
};

export const transformAdaptorFollowupPayloadPatch = (
  payload: AdaptorFollowupPayloadPatch
): RESTPatchAPIInteractionFollowupJSONBody => {
  return transformAdaptorMessagePayloadPatch(payload);
};
