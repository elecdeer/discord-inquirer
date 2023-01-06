import { ChannelType } from "discord-api-types/v10";
import assert from "node:assert";

import { adaptorChannelTypesMap } from "../structure";
import { transformers } from "./index";
import { transformNullishDateString } from "./shared";

import type {
  AdaptorPartialChannel,
  AdaptorPartialChannelBase,
  AdaptorPartialThreadChannel,
  AdaptorThreadMetadata,
} from "../structure";
import type {
  APIThreadMetadata,
  APIInteractionDataResolvedChannel,
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

export const transformersChannel = {
  channel: transformChannel,
  threadMetadata: transformThreadMetadata,
};
