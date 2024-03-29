import { reverseRecord } from "../../util/reverseRecord";

import type { Snowflake } from "./index";

export const adaptorChannelTypesMap = {
  0: "guildText",
  1: "dm",
  2: "guildVoice",
  3: "groupDm",
  4: "guildCategory",
  5: "guildAnnouncement",
  10: "announcementThread",
  11: "publicThread",
  12: "privateThread",
  13: "guildStageVoice",
  14: "guildDirectory",
  15: "guildForum",
} as const satisfies Record<number, string>;

export const channelTypesMap = reverseRecord(adaptorChannelTypesMap);

export type AdaptorTypeSpecifiedChannel<T extends AdaptorChannelTypes> = {
  guildText: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildText";
  };
  dm: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "dm";
  };
  guildVoice: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildVoice";
  };
  groupDm: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "groupDm";
  };
  guildCategory: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildCategory";
  };
  guildAnnouncement: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildAnnouncement";
  };
  announcementThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "announcementThread";
  };
  publicThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "publicThread";
  };
  privateThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "privateThread";
  };
  guildStageVoice: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildStageVoice";
  };
  guildDirectory: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildDirectory";
  };
  guildForum: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildForum";
  };
}[T];

/**
 * @see adaptorChannelTypesMap
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export type AdaptorChannelTypes =
  (typeof adaptorChannelTypesMap)[keyof typeof adaptorChannelTypesMap];

/**
 * Partial Channel objects only have id, name, type and permissions fields.
 *
 * Threads will also have thread_metadata and parent_id fields.
 *
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
 */
export type AdaptorPartialChannel =
  | AdaptorPartialNonThreadChannel
  | AdaptorPartialThreadChannel;

export type AdaptorPartialNonThreadChannel = {
  type: Exclude<
    AdaptorChannelTypes,
    "announcementThread" | "publicThread" | "privateThread"
  >;
} & AdaptorPartialChannelBase;

export type AdaptorPartialThreadChannel = {
  type: Extract<
    AdaptorChannelTypes,
    "announcementThread" | "publicThread" | "privateThread"
  >;
} & AdaptorPartialThreadChannelBase;

export interface AdaptorPartialChannelBase {
  /**
   * the id of this channel
   */
  id: Snowflake;

  /**
   * the name of the channel (1-100 characters)
   */
  name: string | null;
}

export interface AdaptorPartialThreadChannelBase
  extends AdaptorPartialChannelBase {
  /**
   * thread-specific fields not needed by other channels
   */
  threadMetadata: AdaptorThreadMetadata;

  /**
   * for threads: id of the text channel this thread was created
   */
  parentId: Snowflake;
}

/**
 * @see https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure
 */
export interface AdaptorThreadMetadata {
  /**
   * whether the thread is archived
   */
  archived: boolean;

  /**
   * duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080
   */
  autoArchiveDuration: 60 | 1440 | 4320 | 10080;

  /**
   * timestamp when the thread's archive status was last changed, used for calculating recent activity
   */
  archiveTimestamp: Date;

  /**
   * 	whether the thread is locked; when a thread is locked, only users with MANAGE_THREADS can unarchive it
   */
  locked: boolean;

  /**
   * whether non-moderators can add other non-moderators to a thread; only available on private threads
   *
   * @default false (if not present)
   */
  invitable: boolean;

  /**
   * timestamp when the thread was created; only populated for threads created after 2022-01-09
   */
  createdTimestamp: Date | null;
}

/**
 * @see https://discord.com/developers/docs/resources/channel#attachment-object-attachment-structure
 */
export interface AdaptorAttachment {
  /**
   * attachment id
   */
  id: Snowflake;

  /**
   * name of file attached
   */
  filename: string;

  /**
   * description for the file (max 1024 characters)
   */
  description: string | null;

  /**
   * the attachment's media type
   * @see https://en.wikipedia.org/wiki/Media_type
   */
  contentType: string | null;

  /**
   * size of file in bytes
   */
  size: number;

  /**
   * source url of file
   */
  url: string;

  /**
   * a proxied url of file
   */
  proxyUrl: string;

  /**
   * height of file (if image)
   */
  height: number | null;

  /**
   * width of file (if image)
   */
  width: number | null;

  /**
   * whether this attachment is ephemeral
   *
   * @default false (if not present)
   */
  ephemeral: boolean;
}
