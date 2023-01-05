import { transformers } from "./index";

import type {
  AdaptorFollowupPayload,
  AdaptorFollowupPayloadPatch,
} from "../structure";
import type {
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupJSONBody,
} from "discord-api-types/v10";
import type { ReadonlyDeep } from "type-fest";

const transformAdaptorFollowupPayload = (
  payload: AdaptorFollowupPayload
): ReadonlyDeep<RESTPostAPIInteractionFollowupJSONBody> => {
  return transformers.adaptorMessagePayload(payload);
};

const transformAdaptorFollowupPayloadPatch = (
  payload: AdaptorFollowupPayloadPatch
): ReadonlyDeep<RESTPatchAPIInteractionFollowupJSONBody> => {
  return transformers.adaptorMessagePayloadPatch(payload);
};

export const transformersAdaptorFollowupPayload = {
  adaptorFollowupPayload: transformAdaptorFollowupPayload,
  adaptorFollowupPayloadPatch: transformAdaptorFollowupPayloadPatch,
};
