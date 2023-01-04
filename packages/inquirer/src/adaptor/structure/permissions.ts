import type { Snowflake } from "./index";

export type AdaptorPermissions = Record<AdaptorPermissionFlags, boolean>;

export type AdaptorPermissionFlags = keyof typeof adaptorPermissionFlagsMap;

export const adaptorPermissionFlagsMap = {
  /** Allows creation of instant invites */
  createInstantInvite: 1n << 0n,
  /** Allows kicking members */
  kickMembers: 1n << 1n,
  /** Allows banning members */
  banMembers: 1n << 2n,
  /** Allows all permissions and bypasses channel permission overwrites */
  administrator: 1n << 3n,
  /** Allows management and editing of channels */
  manageChannels: 1n << 4n,
  /** Allows management and editing of the guild */
  manageGuild: 1n << 5n,
  /** Allows for the addition of reactions to messages */
  addReactions: 1n << 6n,
  /** Allows for viewing of audit logs */
  viewAuditLog: 1n << 7n,
  /** Allows for using priority speaker in a voice channel */
  prioritySpeaker: 1n << 8n,
  /** Allows the user to go live */
  stream: 1n << 9n,
  /** Allows guild members to view a channel, which includes reading messages in text channels and joining voice channels */
  viewChannel: 1n << 10n,
  /** Allows for sending messages in a channel and creating threads in a forum (does not allow sending messages in threads) */
  sendMessages: 1n << 11n,
  /** Allows for sending of /tts messages */
  sendTTSMessages: 1n << 12n,
  /** Allows for deletion of other users messages */
  manageMessages: 1n << 13n,
  /** Links sent by users with this permission will be auto-embedded */
  embedLinks: 1n << 14n,
  /** Allows for uploading images and files */
  attachFiles: 1n << 15n,
  /** Allows for reading of message history */
  readMessageHistory: 1n << 16n,
  /** Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel */
  mentionEveryone: 1n << 17n,
  /** Allows the usage of custom emojis from other servers */
  useExternalEmojis: 1n << 18n,
  /** Allows for viewing guild insights	 */
  viewGuildInsights: 1n << 19n,
  /** Allows for joining of a voice channel */
  connect: 1n << 20n,
  /** Allows for speaking in a voice channel */
  speak: 1n << 21n,
  /** Allows for muting members in a voice channel */
  muteMembers: 1n << 22n,
  /** Allows for deafening of members in a voice channel */
  deafenMembers: 1n << 23n,
  /** Allows for moving of members between voice channels */
  moveMembers: 1n << 24n,
  /** Allows for using voice-activity-detection in a voice channel */
  useVAD: 1n << 25n,
  /** Allows for modification of own nickname */
  changeNickname: 1n << 26n,
  /** Allows for modification of other users nicknames	 */
  manageNicknames: 1n << 27n,
  /** Allows management and editing of roles */
  manageRoles: 1n << 28n,
  /** Allows management and editing of webhooks */
  manageWebhooks: 1n << 29n,
  /** Allows management and editing of emojis and stickers	 */
  manageEmojis: 1n << 30n,
  /** Allows members to use application commands, including slash commands and context menu commands. */
  useApplicationCommands: 1n << 31n,
  /** Allows for requesting to speak in stage channels. (This permission is under active development and may be changed or removed.) */
  requestToSpeak: 1n << 32n,
  /** Allows for creating, editing, and deleting scheduled events */
  manageEvents: 1n << 33n,
  /** Allows for deleting and archiving threads, and viewing all private threads */
  manageThreads: 1n << 34n,
  /** Allows for creating public and announcement threads */
  createPublicThreads: 1n << 35n,
  /** Allows for creating private threads */
  createPrivateThreads: 1n << 36n,
  /** Allows the usage of custom stickers from other servers */
  useExternalStickers: 1n << 37n,
  /** Allows for sending messages in threads */
  sendMessagesInThreads: 1n << 38n,
  /** Allows for using Activities (applications with the EMBEDDED flag) in a voice channel */
  startEmbeddedActivities: 1n << 39n,
  /** Allows for timing out users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels */
  moderateMembers: 1n << 40n,
} as const satisfies Record<string, bigint>;

/**
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export interface AdaptorRole {
  /**
   * Role id
   */
  id: Snowflake;

  /**
   * Role name
   */
  name: string;

  /**
   * Integer representation of hexadecimal color code
   */
  color: number;

  /**
   * If this role is pinned in the user listing
   */
  hoist: boolean;

  /**
   * role icon hash
   * @see https://discord.com/developers/docs/reference#image-formatting
   */
  icon: string | null;

  /**
   * role unicode emoji
   */
  unicodeEmoji: string | null;

  /**
   * Position of this role
   */
  position: number;

  /**
   * parsed permission flags
   */
  permissions: AdaptorPermissions;

  /**
   * whether this role is managed by an integration
   */
  managed: boolean;

  /**
   * whether this role is mentionable
   */
  mentionable: boolean;

  /**
   * the tags this role has
   */
  tags: AdaptorRoleTags | null;
}

/**
 * @see https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure
 */
export interface AdaptorRoleTags {
  /**
   * The id of the bot this role belongs to
   */
  botId: Snowflake | null;

  /**
   * The id of the integration this role belongs to
   */
  integrationId: Snowflake | null;

  /**
   * Whether this is the guild's premium subscriber role
   */
  premiumSubscriber: true | null;
}
