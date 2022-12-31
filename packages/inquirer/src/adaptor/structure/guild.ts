import type { User } from "./user";

export interface Member {
  /**
   * the user this guild member represents
   * @see https://discord.com/developers/docs/resources/user#user-object
   */
  user?: User;

  /**
   * this users guild nickname
   */
  nick?: string;

  /**
   * array of role object ids
   * @see https://discord.com/developers/docs/topics/permissions#role-object
   */
  avatar?: string;

  /**
   * when the user joined the guild
   * @see https://discord.com/developers/docs/reference#snowflakes
   */
  roles: string[];

  /**
   * when the user started boosting the guild
   */
  joinedAt: string;

  /**
   * when the user started boosting the guild
   * @see https://discord.com/developers/docs/resources/guild#guild-object-premium-tier
   */
  premiumSince?: string;

  /**
   * whether the user is deafened in voice channels
   */
  deaf: boolean;

  /**
   * whether the user is muted in voice channels
   */
  mute: boolean;

  /**
   * whether the user has not yet passed the guild's Membership Screening requirements
   * @see https://discord.com/developers/docs/resources/guild#guild-membership-screening-object
   */
  pending?: boolean;

  /**
   * total permissions of the member in the channel, including overwrites, returned when in the interaction object
   */
  permissions?: string;

  /**
   * when the user's timeout will expire and the user will be able to communicate in the guild again, null or a time in the past if the user is not timed out
   * @see https://support.discord.com/hc/en-us/articles/4413305239191-Time-Out-FAQ
   */
  communicationDisabledUntil?: Date;
}

export type PartialMember = Omit<Member, "user" | "deaf" | "mute">;
