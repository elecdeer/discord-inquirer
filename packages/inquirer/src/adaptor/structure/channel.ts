import type { Snowflake } from "./index";
import type { User } from "./user";

export const ChannelTypesMap = {
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
} as const satisfies Record<Channel["type"], number>;

/**
 * @see ChannelTypesMap
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export type ChannelTypes = Channel["type"];

export type Channel =
  | GuildTextChannel
  | DmChannel
  | GuildVoiceChannel
  | GroupDmChannel
  | GuildCategoryChannel
  | GuildAnnouncementChannel
  | AnnouncementThreadChannel
  | PublicThreadChannel
  | PrivateThreadChannel
  | GuildStageVoiceChannel
  | GuildDirectoryChannel
  | GuildForumChannel;

/**
 * a text channel within a server
 */
export interface GuildTextChannel
  extends Omit<ChannelBase, "name">,
    TextChannelBase,
    GuildChannelBase,
    ThreadParentBase {
  type: "guildText";
}

/**
 * 	a direct message between users
 */
export interface DmChannel extends ChannelBase, TextChannelBase, DMChannelBase {
  type: "dm";
}

/**
 * a voice channel within a server
 */
export interface GuildVoiceChannel
  extends Omit<ChannelBase, "name">,
    VoiceChannelBase,
    TextChannelBase,
    GuildChannelBase {
  type: "guildVoice";
}

/**
 * a direct message between multiple users
 */
export interface GroupDmChannel
  extends ChannelBase,
    TextChannelBase,
    DMChannelBase,
    DMGroupChannelBase {
  type: "groupDm";
}

export interface GuildCategoryChannel
  extends Omit<ChannelBase, "name">,
    GuildChannelBase {
  type: "guildCategory";
}

export interface GuildAnnouncementChannel
  extends Omit<ChannelBase, "name">,
    TextChannelBase,
    GuildChannelBase,
    ThreadParentBase {
  type: "guildAnnouncement";
}

export interface AnnouncementThreadChannel
  extends Omit<ChannelBase, "name">,
    TextChannelBase,
    Omit<GuildChannelBase, "parentId">,
    ThreadChannelBase {
  type: "announcementThread";
}

export interface PublicThreadChannel
  extends Omit<ChannelBase, "name">,
    TextChannelBase,
    Omit<GuildChannelBase, "parentId">,
    ThreadChannelBase {
  type: "publicThread";
}

export interface PrivateThreadChannel
  extends Omit<ChannelBase, "name">,
    TextChannelBase,
    Omit<GuildChannelBase, "parentId">,
    ThreadChannelBase {
  type: "privateThread";
}

export interface GuildStageVoiceChannel
  extends Omit<ChannelBase, "name">,
    VoiceChannelBase,
    TextChannelBase,
    GuildChannelBase {
  type: "guildStageVoice";
}

/**
 * the channel in a hub containing the listed servers
 */
export interface GuildDirectoryChannel
  extends Omit<ChannelBase, "name">,
    GuildChannelBase {
  type: "guildDirectory";
}

export interface GuildForumChannel
  extends Omit<ChannelBase, "name">,
    GuildChannelBase,
    ThreadParentBase,
    ForumChannelBase {
  type: "guildForum";
}

/**
 * Partial Channel objects only have id, name, type and permissions fields. Threads will also have thread_metadata and parent_id fields.
 */
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
  name?: string | null;

  /**
   * computed permissions for the invoking user in the channel, including overwrites, only included when part of the resolved data received on a slash command interaction
   */
  permissions?: string;
}

export interface ChannelBase extends Omit<PartialChannel, "type"> {
  /**
   * channel flags combined as a bitfield
   */
  flags?: number;
}

export interface GuildChannelBase {
  /**
   * the name of the channel (1-100 characters)
   *
   * in guild, this is not optional
   */
  name: string;

  /**
   * the id of the guild (maybe missing for some channel objects received over gateway guild dispatches)
   */
  guildId: Snowflake;

  /**
   * explicit permission overwrites for members and roles
   */
  permissionOverwrites: Overwrite[];

  /**
   * sorting position of the channel
   */
  position: number;

  /**
   * for guild channels: id of the parent category for a channel (each parent category can contain up to 50 channels)
   */
  parentId: Snowflake | null;

  /**
   * whether the channel is nsfw
   */
  nsfw: boolean;

  /**
   * the channel topic (0-4096 characters for GUILD_FORUM channels, 0-1024 characters for all others)
   */
  topic: string | null;
}

export interface TextChannelBase {
  /**
   * the id of the last message sent in this channel (or thread for GUILD_FORUM channels) (may not point to an existing or valid message or thread)
   */
  lastMessageId: Snowflake | null;

  /**
   * when the last pinned message was pinned
   */
  lastPinTimestamp: string | null;

  /**
   * amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission manage_messages or manage_channel, are unaffected
   */
  rateLimitPerUser: number;
}

export interface VoiceChannelBase {
  /**
   * the bitrate (in bits) of the voice channel
   */
  bitrate: number;

  /**
   * the user limit of the voice channel
   */
  userLimit: number;

  /**
   * voice region id for the voice channel, automatic when set to null
   */
  rtcRegion: string | null;

  /**
   * the camera video quality mode of the voice channel, 1 when not present
   */
  videoQualityMode?: VideoQualityMode;
}

export const VideoQualityModeMap = {
  /**
   * Discord chooses the quality for optimal performance
   */
  auto: 1,

  /**
   * 720p
   */
  full: 2,
} as const satisfies Record<string, 1 | 2>;

/**
 * @see VideoQualityModeMap
 * @see https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes
 */
export type VideoQualityMode = keyof typeof VideoQualityModeMap;

export interface ThreadChannelBase {
  /**
   * id of the creator of the group DM or thread
   */
  ownerId: Snowflake;

  /**
   * for threads: id of the text channel this thread was created
   */
  parentId: Snowflake | null;

  /**
   * number of messages ever sent in a thread, it's similar to message_count on message creation, but will not decrement the number when a message is deleted
   */
  totalMessageSent: number;

  /**
   * number of messages (not including the initial message or deleted messages) in a thread.
   * the message count is inaccurate when it's greater than 50.
   */
  messageCount: number;

  /**
   * an approximate count of users in a thread, stops counting at 50
   */
  memberCount: number;

  /**
   * thread-specific fields not needed by other channels
   */
  threadMetadata: ThreadMetadata | null;

  /**
   * thread member object for the current user, if they have joined the thread, only included on certain API endpoints
   */
  member: ThreadMember | null;
}

export interface ThreadParentBase {
  /**
   * default duration, copied onto newly created threads, in minutes, threads will stop showing in the channel list after the specified period of inactivity, can be set to: 60, 1440, 4320, 10080
   */
  defaultAutoArchiveDuration?: 60 | 1440 | 4320 | 10080;

  /**
   * the initial rate_limit_per_user to set on newly created threads in a channel. this field is copied to the thread at creation time and does not live update.
   */
  defaultThreadRateLimitPerUser?: number;
}

export interface ForumChannelBase {
  /**
   * the set of tags that can be used in a GUILD_FORUM channel
   */
  availableTags?: string[];

  /**
   * the IDs of the set of tags that have been applied to a thread in a GUILD_FORUM channel
   */
  appliedTags: string[];

  /**
   * the emoji to show in the add reaction button on a thread in a GUILD_FORUM channel
   */
  defaultReactionEmoji?: DefaultReactionEmoji;

  /**
   * the default sort order type used to order posts in GUILD_FORUM channels. Defaults to null, which indicates a preferred sort order hasn't been set by a channel admin
   */
  defaultSortOrder?: SortOrderTypes;

  /**
   * the default forum layout view used to display posts in GUILD_FORUM channels. Defaults to 0, which indicates a layout view has not been set by a channel admin
   */
  defaultForumLayout: ForumLayoutTypes;
}

/**
 * @see https://discord.com/developers/docs/resources/channel#default-reaction-object-default-reaction-structure
 */
export interface DefaultReactionEmoji {
  /**
   * the id of the emoji
   */
  emojiId: Snowflake | null;

  /**
   * the name of the emoji
   */
  emojiName: string | null;
}

export const SortOrderTypesMap = {
  /**
   * Sort forum posts by activity
   */
  latestActivity: 0,

  /**
   * Sort forum posts by creation time (from most recent to oldest)
   */
  creationDate: 1,
};

/**
 * @see SortOrderTypesMap
 * @see https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types
 */
export type SortOrderTypes = keyof typeof SortOrderTypesMap;

export const ForumLayoutTypesMap = {
  /**
   * No default has been set for forum channel
   */
  notSet: 0,

  /**
   * Display posts as a list
   */
  listView: 1,

  /**
   * Display posts as a collection of tiles
   */
  galleryView: 2,
};

/**
 * @see ForumLayoutTypesMap
 * @see https://discord.com/developers/docs/resources/channel#channel-object-forum-layout-types
 */
export type ForumLayoutTypes = keyof typeof ForumLayoutTypesMap;

export interface DMChannelBase {
  /**
   * id of the creator of the group DM or thread
   */
  ownerId: Snowflake;

  /**
   * the recipients of the DM
   */
  recipients: User[];

  /**
   * icon hash of the group DM
   */
  icon: string | null;
}

export interface DMGroupChannelBase {
  /**
   * application id of the group DM creator if it is bot-created
   */
  applicationId: Snowflake | null;
}

export interface Overwrite {
  /**
   * role or user id
   */
  id: Snowflake;

  /**
   * either 0 (role) or 1 (member)
   */
  type: OverwriteTypes;

  /**
   * permission bit set
   */
  allow: string;

  /**
   * permission bit set
   */
  deny: string;
}

export const OverwriteTypesMap = {
  role: 0,
  member: 1,
};

/**
 * @see OverwriteTypesMap
 * @see https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure
 */
export type OverwriteTypes = keyof typeof OverwriteTypesMap;

export interface ThreadMetadata {
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
