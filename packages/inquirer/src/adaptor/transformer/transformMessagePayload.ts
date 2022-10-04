import { AllowedMentionsTypes } from "discord-api-types/v10";

import { transformActionRowComponent } from "./transformComponent";
import { transformEmbed } from "./transformEmbed";

import type {
  AllowedMentions,
  MessagePayload,
  MessagePayloadPatch,
  MessageReference,
} from "../structure";
import type {
  APIAllowedMentions,
  APIMessageReferenceSend,
  RESTPostAPIChannelMessageJSONBody,
  RESTPatchAPIChannelMessageJSONBody,
} from "discord-api-types/v10";

export const transformMessagePayload = (
  payload: MessagePayload
): RESTPostAPIChannelMessageJSONBody => {
  return {
    ...payload,
    content: payload.content,
    embeds: payload.embeds?.map(transformEmbed),
    allowed_mentions:
      payload.allowedMentions &&
      transformAllowedMentions(payload.allowedMentions),
    message_reference:
      payload.messageReference &&
      transformMessageReference(payload.messageReference),
    components: payload.components?.map(transformActionRowComponent),
    sticker_ids: payload.stickerIds,
    flags: transformFlags(payload),
  };
};

export const transformMessagePayloadPatch = (
  payload: MessagePayloadPatch
): RESTPatchAPIChannelMessageJSONBody => {
  return {
    ...payload,
    content: payload.content,
    embeds: payload.embeds?.map(transformEmbed),
    allowed_mentions:
      payload.allowedMentions &&
      transformAllowedMentions(payload.allowedMentions),
    components: payload.components?.map(transformActionRowComponent),
    flags: transformFlags(payload),
  };
};

export const transformAllowedMentions = (
  allowedMentions: AllowedMentions
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

export const transformMessageReference = (
  ref: MessageReference
): APIMessageReferenceSend => {
  return {
    ...ref,
    message_id: ref.messageId,
    fail_if_not_exists: ref.failIfNotExists,
  };
};

export const transformFlags = (params: {
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
