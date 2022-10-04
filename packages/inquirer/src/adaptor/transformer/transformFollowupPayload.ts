import {
  transformMessagePayload,
  transformMessagePayloadPatch,
} from "./transformMessagePayload";

import type { FollowupPayload, FollowupPayloadPatch } from "../structure";
import type {
  RESTPatchAPIInteractionFollowupJSONBody,
  RESTPostAPIInteractionFollowupJSONBody,
} from "discord-api-types/v10";

export const transformFollowupPayload = (
  payload: FollowupPayload
): RESTPostAPIInteractionFollowupJSONBody => {
  return transformMessagePayload(payload);
};

export const transformFollowupPayloadPatch = (
  payload: FollowupPayloadPatch
): RESTPatchAPIInteractionFollowupJSONBody => {
  return transformMessagePayloadPatch(payload);
};
