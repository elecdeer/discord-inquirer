import type { Snowflake } from "./index";

/**
 * @see https://discord.com/developers/docs/resources/user#user-object-user-structure
 */
export interface AdaptorUser {
  /**
   * the user's id
   */
  id: Snowflake;

  /**
   * the user's username, not unique across the platform
   */
  username: string;

  /**
   * the user's 4-digit discord-tag
   */
  discriminator: string;

  /**
   * the user's avatar hash
   * if null, the user has no avatar
   * @see https://discord.com/developers/docs/reference#image-formatting
   */
  avatar: string | null;

  /**
   * whether the user belongs to an OAuth2 application
   *
   * @default false (if not present)
   */
  bot: boolean;

  /**
   * whether the user is an Official Discord System user (part of the urgent message system)
   *
   * @default false (if not present)
   */
  system: boolean;

  /**
   * whether the user has two factor enabled on their account
   *
   * @default false (if not present)
   */
  mfaEnabled: boolean;

  /**
   * the user's banner hash
   * @see https://discord.com/developers/docs/reference#image-formatting
   */
  banner: string | null;

  /**
   * the user's accent color
   */
  accentColor: number | null;

  /**
   * the user's chosen language option
   */
  locale: string | null;

  /**
   * whether the email on this account has been verified
   */
  verified: boolean | null;

  /**
   * the user's email
   */
  email: string | null;

  /**
   * the flags on a user's account
   * @see https://discord.com/developers/docs/resources/user#user-object-user-flags
   *
   * @default 0 (if not present)
   */
  flags: number;

  /**
   * the type of Nitro subscription on a user's account
   * @see https://discord.com/developers/docs/resources/user#user-object-premium-types
   *
   * @default 0 (if not present)
   */
  premiumType: number;

  /**
   * the public flags on a user's account
   * @see https://discord.com/developers/docs/resources/user#user-object-user-flags
   *
   * @default 0 (if not present)
   */
  publicFlags: number;
}
