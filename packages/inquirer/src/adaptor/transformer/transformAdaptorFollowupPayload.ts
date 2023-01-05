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
  return transformers.transformAdaptorMessagePayload(payload);
};

const transformAdaptorFollowupPayloadPatch = (
  payload: AdaptorFollowupPayloadPatch
): RESTPatchAPIInteractionFollowupJSONBody => {
  return transformers.transformAdaptorMessagePayloadPatch(payload);
};

export const transformersAdaptorFollowupPayload = {
  transformAdaptorFollowupPayload,
  transformAdaptorFollowupPayloadPatch,
};
