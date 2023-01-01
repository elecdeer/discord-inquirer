import type { Snowflake } from "./index";

export const AdaptorChannelTypesMap = {
  guildText: 0,
  dm: 1,
  guildVoice: 2,
  groupDm: 3,
  guildCategory: 4,
  guildAnnouncement: 5,
  announcementThread: 10,
  publicThread: 11,
  privateThread: 12,
  guildStageVoice: 13,
  guildDirectory: 14,
  guildForum: 15,
} as const satisfies Record<string, number>;

/**
 * @see AdaptorChannelTypesMap
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export type AdaptorChannelTypes = keyof typeof AdaptorChannelTypesMap;

/**
 * Partial Channel objects only have id, name, type and permissions fields.
 *
 * Threads will also have thread_metadata and parent_id fields.
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

  /**
   * computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction
   */
  permissions: string | null;
}

export interface AdaptorPartialThreadChannelBase
  extends AdaptorPartialChannelBase {
  /**
   * thread-specific fields not needed by other channels
   */
  threadMetadata: AdaptorThreadMetadata | null;

  /**
   * for threads: id of the text channel this thread was created
   */
  parentId: Snowflake | null;
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
