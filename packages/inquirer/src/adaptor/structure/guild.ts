/**
 * Partial Member objects are missing user, deaf and mute fields
 * @see https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure
 */
export interface PartialMember {
  /**
   * this users guild nickname
   */
  nick: string | null;

  /**
   * array of role object ids
   * @see https://discord.com/developers/docs/topics/permissions#role-object
   */
  avatar: string | null;

  /**
   * when the user joined the guild
   * @see https://discord.com/developers/docs/reference#snowflakes
   */
  roles: string[];

  /**
   * when the user started boosting the guild
   */
  joinedAt: Date;

  /**
   * when the user started boosting the guild
   * @see https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
   */
  premiumSince: Date | null;

  /**
   * whether the user has not yet passed the guild's Membership Screening requirements
   * @see https://discord.com/developers/docs/resources/guild#guild-membership-screening-object
   *
   * @default false (if not present)
   */
  pending: boolean;

  /**
   * total permissions of the member in the channel, including overwrites, returned when in the interaction object
   */
  permissions: string | null;

  /**
   * when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
   * @see https://support.discord.com/hc/en-us/articles/4413305239191-Time-Out-FAQ
   */
  communicationDisabledUntil: Date | null;
}
