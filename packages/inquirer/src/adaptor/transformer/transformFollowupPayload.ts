import {
  transformMessagePayload,
  transformMessagePayloadPatch,
} from "./transformMessagePayload";

import type {
  AdaptorFollowupPayload,
  AdaptorFollowupPayloadPatch,
} from "../structure";
import type {
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupJSONBody,
} from "discord-api-types/v10";

export const transformFollowupPayload = (
  payload: AdaptorFollowupPayload
): RESTPostAPIInteractionFollowupJSONBody => {
  return transformMessagePayload(payload);
};

export const transformFollowupPayloadPatch = (
  payload: AdaptorFollowupPayloadPatch
): RESTPatchAPIInteractionFollowupJSONBody => {
  return transformMessagePayloadPatch(payload);
};
