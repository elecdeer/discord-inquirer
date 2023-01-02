import type { Snowflake } from "./index";

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
   * permission bit set
   */
  permissions: string;

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
