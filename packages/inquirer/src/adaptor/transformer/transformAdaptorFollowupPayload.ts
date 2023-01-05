import { transformers } from "./index";

import type {
  AdaptorFollowupPayload,
  AdaptorFollowupPayloadPatch,
} from "../structure";
import type {
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupJSONBody,
} from "discord-api-types/v10";

const transformAdaptorFollowupPayload = (
  payload: AdaptorFollowupPayload
): RESTPostAPIInteractionFollowupJSONBody => {
  return transformers.adaptorMessagePayload(payload);
};

const transformAdaptorFollowupPayloadPatch = (
  payload: AdaptorFollowupPayloadPatch
): RESTPatchAPIInteractionFollowupJSONBody => {
  return transformers.adaptorMessagePayloadPatch(payload);
};

export const transformersAdaptorFollowupPayload = {
  adaptorFollowupPayload: transformAdaptorFollowupPayload,
  adaptorFollowupPayloadPatch: transformAdaptorFollowupPayloadPatch,
};
