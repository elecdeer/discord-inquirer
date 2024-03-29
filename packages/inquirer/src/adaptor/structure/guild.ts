import type { AdaptorPermissions, Snowflake } from "./index";

/**
 * Partial Member objects are missing user, deaf and mute fields
 * @see https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure
 */
export interface AdaptorPartialMember {
  /**
   * this users guild nickname
   */
  nick: string | null;

  /**
   * the member's guild avatar hash
   * @see https://discord.com/developers/docs/reference#image-formatting
   */
  avatar: string | null;

  /**
   * array of role object ids
   * @see https://discord.com/developers/docs/topics/permissions#role-object
   */
  roles: Snowflake[];

  /**
   * when the user joined the guild
   * @see https://discord.com/developers/docs/reference#snowflakes
   */
  joinedAt: Date;

  /**
   * when the user started boosting the guild
   * @see https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
   */
  premiumSince: Date | null;

  /**
   * guild member flags represented as a bit set
   * @see https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags
   */
  flag: AdaptorMemberFlag;

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
  permissions: AdaptorPermissions | null;

  /**
   * when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
   * @see https://support.discord.com/hc/en-us/articles/4413305239191-Time-Out-FAQ
   */
  communicationDisabledUntil: Date | null;
}

export const adaptorMemberFlagsMap = {
  didRejoin: 1 << 0,
  completedOnboarding: 1 << 1,
  bypassesVerification: 1 << 2,
  startedVerification: 1 << 3,
} satisfies Record<keyof AdaptorMemberFlag, number>;

/**
 * https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-flags
 */
export interface AdaptorMemberFlag {
  /**
   * Member has left and rejoined the guild
   */
  didRejoin: boolean;

  /**
   * Member has completed onboarding
   */
  completedOnboarding: boolean;

  /**
   * Member is exempt from guild verification requirements
   */
  bypassesVerification: boolean;

  /**
   * Member has started onboarding
   */
  startedVerification: boolean;
}
