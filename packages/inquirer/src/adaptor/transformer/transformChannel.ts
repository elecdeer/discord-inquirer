import { ChannelType } from "discord-api-types/v10";
import assert from "node:assert";

import { transformers } from "./index";
import { transformNullishDateString } from "./shared";
import { adaptorChannelTypesMap } from "../structure";

import type {
  AdaptorAttachment,
  AdaptorPartialChannel,
  AdaptorPartialChannelBase,
  AdaptorPartialThreadChannel,
  AdaptorThreadMetadata,
} from "../structure";
import type {
  APIAttachment,
  APIInteractionDataResolvedChannel,
  APIThreadMetadata,
} from "discord-api-types/v10";

const transformThreadMetadata = (
  metadata: APIThreadMetadata
): AdaptorThreadMetadata => {
  return {
    archived: metadata.archived,
    autoArchiveDuration: metadata.auto_archive_duration,
    archiveTimestamp: new Date(metadata.archive_timestamp),
    locked: metadata.locked ?? false,
    invitable: metadata.invitable ?? false,
    createdTimestamp: transformNullishDateString(metadata.create_timestamp),
  };
};

const transformChannel = (
  channel: APIInteractionDataResolvedChannel
): AdaptorPartialChannel => {
  const base: AdaptorPartialChannelBase = {
    id: channel.id,
    name: channel.name ?? null,
  };

  if (
    channel.type === ChannelType.AnnouncementThread ||
    channel.type === ChannelType.PublicThread ||
    channel.type === ChannelType.PrivateThread
  ) {
    assert(channel.parent_id);
    assert(channel.thread_metadata);

    return {
      type: adaptorChannelTypesMap[channel.type],
      ...base,
      parentId: channel.parent_id,
      threadMetadata: transformers.threadMetadata(channel.thread_metadata),
    } satisfies AdaptorPartialThreadChannel;
  } else {
    return {
      type: adaptorChannelTypesMap[channel.type],
      ...base,
    } satisfies AdaptorPartialChannel;
  }
};

const transformAttachment = (attachment: APIAttachment): AdaptorAttachment => {
  return {
    id: attachment.id,
    filename: attachment.filename,
    description: attachment.description ?? null,
    contentType: attachment.content_type ?? null,
    size: attachment.size,
    url: attachment.url,
    proxyUrl: attachment.proxy_url,
    height: attachment.height ?? null,
    width: attachment.width ?? null,
    ephemeral: attachment.ephemeral ?? false,
  };
};

export const transformersChannel = {
  channel: transformChannel,
  threadMetadata: transformThreadMetadata,
  attachment: transformAttachment,
};
