import { AllowedMentionsTypes } from "discord-api-types/v10";

import { transformAdaptorActionRowComponent } from "./transformAdaptorComponent";
import { transformAdaptorEmbed } from "./transformAdaptorEmbed";

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

export const transformAdaptorMessagePayload = (
  payload: AdaptorMessagePayload
): RESTPostAPIChannelMessageJSONBody => {
  return {
    ...payload,
    content: payload.content,
    embeds: payload.embeds?.map(transformAdaptorEmbed),
    allowed_mentions:
      payload.allowedMentions &&
      transformAdaptorAllowedMentions(payload.allowedMentions),
    message_reference:
      payload.messageReference &&
      transformAdaptorMessageReference(payload.messageReference),
    components: payload.components?.map(transformAdaptorActionRowComponent),
    sticker_ids: payload.stickerIds,
    flags: transformAdaptorFlags(payload),
  };
};

export const transformAdaptorMessagePayloadPatch = (
  payload: AdaptorMessagePayloadPatch
): RESTPatchAPIChannelMessageJSONBody => {
  return {
    ...payload,
    content: payload.content,
    embeds: payload.embeds?.map(transformAdaptorEmbed),
    allowed_mentions:
      payload.allowedMentions &&
      transformAdaptorAllowedMentions(payload.allowedMentions),
    components: payload.components?.map(transformAdaptorActionRowComponent),
    flags: transformAdaptorFlags(payload),
  };
};

export const transformAdaptorAllowedMentions = (
  allowedMentions: AdaptorAllowedMentions
): APIAllowedMentions => {
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

export const transformAdaptorMessageReference = (
  ref: AdaptorMessageReference
): APIMessageReferenceSend => {
  return {
    ...ref,
    message_id: ref.messageId,
    fail_if_not_exists: ref.failIfNotExists,
  };
};

export const transformAdaptorFlags = (params: {
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
