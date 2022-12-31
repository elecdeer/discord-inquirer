import type { Snowflake } from "./index";
import type { User } from "./user";

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export type ChannelTypes =
  | "guildText"
  | "dm"
  | "guildVoice"
  | "groupDm"
  | "guildCategory"
  | "guildAnnouncement"
  | "announcementThread"
  | "publicThread"
  | "privateThread"
  | "guildStageVoice"
  | "guildDirectory"
  | "guildForum";

export interface PartialChannel {
  /**
   * the id of this channel
   */
  id: Snowflake;

  /**
   * the type of channel
   */
  type: ChannelTypes;

  /**
   * the name of the channel (1-100 characters)
   */
  name?: string;

  /**
   * computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction
   */
  permissions?: string;
}

export interface Channel extends PartialChannel {
  guildId?: Snowflake;

  position?: number;

  permissionOverwrites?: Overwrite[];

  topic?: string;

  nsfw?: boolean;

  lastMessageId?: Snowflake;

  bitrate?: number;

  userLimit?: number;

  rateLimitPerUser?: number;

  recipients?: User[];

  icon?: string;

  ownerId?: Snowflake;

  applicationId?: Snowflake;

  parentId?: Snowflake;

  lastPinTimestamp?: string;

  rtcRegion?: string;

  videoQualityMode?: number;

  messageCount?: number;

  memberCount?: number;

  threadMetadata?: ThreadMetadata;

  member?: ThreadMember;

  defaultAutoArchiveDuration?: number;

  flags?: number;

  totalMessageSent?: number;

  availableTags?: string[];

  appliedTags?: string[];

  defaultReactionEmoji?: string;

  defaultThreadRateLimitPerUser?: number;

  defaultSortOrder?: number;

  defaultForumLayout?: number;
}

export interface Overwrite {
  /**
   * role or user id
   */
  id: Snowflake;

  /**
   * either 0 (role) or 1 (member)
   */
  type: 0 | 1;

  /**
   * permission bit set
   */
  allow: string;

  /**
   * permission bit set
   */
  deny: string;
}

export interface ThreadMetadata {
  /**
   * whether the thread is archived
   */
  archived: boolean;

  /**
   * duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080
   */
  autoArchiveDuration: number;

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
   */
  invitable?: boolean;

  /**
   * timestamp when the thread was created; only populated for threads created after 2022-01-09
   */
  createdTimestamp?: Date;
}

export interface ThreadMember {
  /**
   * the id of the thread
   */
  id: Snowflake;

  /**
   * the id of the user
   */
  userId: Snowflake;

  /**
   * when the current user last joined the thread
   */
  joinTimestamp: Date;

  /**
   * any user-thread settings, currently only used for notifications
   */
  flags: number;
}
