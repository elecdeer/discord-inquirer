import type { Snowflake } from "./index";

export interface Role {
  id: Snowflake;

  name: string;

  color: number;

  hoist: boolean;

  icon: string | null;

  unicodeEmoji: string | null;

  position: number;

  permissions: string;

  managed: boolean;

  mentionable: boolean;

  tags?: RoleTags;
}

export interface RoleTags {
  /**
   * The id of the bot this role belongs to
   */
  botId?: Snowflake;

  /**
   * The id of the integration this role belongs to
   */
  integrationId?: Snowflake;

  /**
   * Whether this is the guild's premium subscriber role
   */
  premiumSubscriber?: null;
}
