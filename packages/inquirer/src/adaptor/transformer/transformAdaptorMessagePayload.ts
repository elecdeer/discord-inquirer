import { AllowedMentionsTypes } from "discord-api-types/v10";

import { transformers } from ".";

import type {
  AdaptorAllowedMentions,
  AdaptorMessagePayload,
  AdaptorMessagePayloadPatch,
  AdaptorMessageReference,
} from "../structure";
import type {
  APIAllowedMentions,
  APIMessageReferenceSend,
  RESTPatchAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import type { ReadonlyDeep } from "type-fest";

const transformAdaptorMessagePayload = (
  payload: AdaptorMessagePayload
): ReadonlyDeep<RESTPostAPIChannelMessageJSONBody> => {
  return {
    ...payload,
    content: payload.content,
    embeds: payload.embeds?.map(transformers.adaptorEmbed),
    allowed_mentions:
      payload.allowedMentions &&
      transformers.adaptorAllowedMentions(payload.allowedMentions),
    message_reference:
      payload.messageReference &&
      transformers.adaptorMessageReference(payload.messageReference),
    components: payload.components?.map(transformers.adaptorActionRowComponent),
    sticker_ids: payload.stickerIds,
    flags: transformers.adaptorMessageFlags(payload),
  };
};

const transformAdaptorMessagePayloadPatch = (
  payload: AdaptorMessagePayloadPatch
): ReadonlyDeep<RESTPatchAPIChannelMessageJSONBody> => {
  return {
    ...payload,
    content: payload.content,
    embeds: payload.embeds?.map(transformers.adaptorEmbed),
    allowed_mentions:
      payload.allowedMentions &&
      transformers.adaptorAllowedMentions(payload.allowedMentions),
    components: payload.components?.map(transformers.adaptorActionRowComponent),
    flags: transformers.adaptorMessageFlags(payload),
  };
};

const transformAdaptorAllowedMentions = (
  allowedMentions: AdaptorAllowedMentions
): ReadonlyDeep<APIAllowedMentions> => {
  const parse: AllowedMentionsTypes[] = [];

  if (allowedMentions.everyone === true) {
    parse.push(AllowedMentionsTypes.Everyone);
  }
  if (allowedMentions.roles === true) {
    parse.push(AllowedMentionsTypes.Role);
  }
  if (allowedMentions.users === true) {
    parse.push(AllowedMentionsTypes.User);
  }

  return {
    parse: parse,
    roles: Array.isArray(allowedMentions.roles)
      ? allowedMentions.roles
      : undefined,
    users: Array.isArray(allowedMentions.users)
      ? allowedMentions.users
      : undefined,
    replied_user: allowedMentions.repliedUser,
  };
};

const transformAdaptorMessageReference = (
  ref: AdaptorMessageReference
): ReadonlyDeep<APIMessageReferenceSend> => {
  return {
    ...ref,
    message_id: ref.messageId,
    fail_if_not_exists: ref.failIfNotExists,
  };
};

const transformAdaptorMessageFlags = (params: {
  suppressEmbeds?: boolean;
  ephemeral?: boolean;
}) => {
  let flags = 0;
  if (params.suppressEmbeds === true) {
    flags |= 1 << 2;
  }
  if (params.ephemeral === true) {
    flags |= 1 << 6;
  }
  return flags;
};

export const transformersAdaptorMessagePayload = {
  adaptorMessagePayload: transformAdaptorMessagePayload,
  adaptorMessagePayloadPatch: transformAdaptorMessagePayloadPatch,
  adaptorAllowedMentions: transformAdaptorAllowedMentions,
  adaptorMessageReference: transformAdaptorMessageReference,
  adaptorMessageFlags: transformAdaptorMessageFlags,
};
