import { transformers } from "../adaptor";
import { createRandomHelper } from "../util/randomSource";

import type {
  AdaptorPartialMember,
  AdaptorPartialNonThreadChannel,
  AdaptorPermissions,
  AdaptorRole,
  AdaptorUser,
  AdaptorUserInvokedInteractionBase,
} from "../adaptor";
import type { AdaptorPartialThreadChannel } from "../adaptor";
import type { RandomSource } from "../util/randomSource";

export const adaptorFaker = (next: RandomSource) => {
  return {
    partialMember: createAdaptorMemberFaker(next),
    partialNonThreadChannel: createAdaptorPartialNonThreadChannelFaker(next),
    partialThreadChannel: createAdaptorPartialThreadChannelFaker(next),
    permissionsDefaultAllow: createAdaptorPermissionsDefaultAllowFaker(),
    permissionsDefaultDeny: createAdaptorPermissionsDefaultDenyFaker(),
    role: createAdaptorRoleFaker(next),
    user: createAdaptorUserFaker(next),
    userInvokedInteractionBase: createUserInvokedInteractionBaseFaker(next),
  };
};

export const createAdaptorPartialNonThreadChannelFaker = (
  next: RandomSource
) => {
  const random = createRandomHelper(next);
  return (data?: Partial<Omit<AdaptorPartialThreadChannel, "type">>) => {
    return {
      id: random.nextSnowflake(),
      name: random.nextString(10),
      ...data,
    } satisfies Omit<AdaptorPartialNonThreadChannel, "type">;
  };
};

export const createAdaptorPartialThreadChannelFaker = (next: RandomSource) => {
  const random = createRandomHelper(next);
  return (data?: Partial<Omit<AdaptorPartialThreadChannel, "type">>) => {
    const randomDate = () => {
      return random.nextDate(
        new Date("2010-01-01T00:00:00.000Z"),
        new Date("2030-12-31T23:59:59.999Z")
      );
    };

    return {
      ...createAdaptorPartialNonThreadChannelFaker(next)(),
      threadMetadata: {
        archived: false,
        autoArchiveDuration: 1440,
        archiveTimestamp: randomDate(),
        locked: false,
        invitable: false,
        createdTimestamp: randomDate(),
      },
      parentId: random.nextSnowflake(),
      ...data,
    } satisfies Omit<AdaptorPartialThreadChannel, "type">;
  };
};

export const createUserInvokedInteractionBaseFaker = (next: RandomSource) => {
  const random = createRandomHelper(next);
  return (data?: Partial<AdaptorUserInvokedInteractionBase<"guild">>) => {
    return {
      id: random.nextSnowflake(),
      applicationId: random.nextSnowflake(),
      token: random.nextString(30),
      version: 1,
      guildId: random.nextSnowflake(),
      channelId: random.nextSnowflake(),
      member: createAdaptorMemberFaker(next)(),
      user: createAdaptorUserFaker(next)(),
      locale: "en-US",
      guildLocale: "en-US",
      appPermissions: createAdaptorPermissionsDefaultAllowFaker()(),
      ...data,
    } satisfies AdaptorUserInvokedInteractionBase<"guild">;
  };
};

export const createAdaptorMemberFaker = (next: RandomSource) => {
  const random = createRandomHelper(next);
  return (data?: Partial<AdaptorPartialMember>) => {
    return {
      nick: random.nextString(10),
      avatar: null,
      roles: [],
      joinedAt: random.nextDate(
        new Date("2010-01-01T00:00:00.000Z"),
        new Date("2030-12-31T23:59:59.999Z")
      ),
      premiumSince: null,
      pending: false,
      permissions: null,
      communicationDisabledUntil: null,
      ...data,
    } satisfies AdaptorPartialMember;
  };
};

export const createAdaptorPermissionsDefaultAllowFaker =
  () =>
  (values: Partial<AdaptorPermissions> = {}): AdaptorPermissions => {
    return {
      ...transformers.permissionFlags(String((1n << 41n) - 1n)),
      ...values,
    };
  };

export const createAdaptorPermissionsDefaultDenyFaker =
  () =>
  (values: Partial<AdaptorPermissions> = {}): AdaptorPermissions => {
    return {
      ...transformers.permissionFlags("0"),
      ...values,
    };
  };

export const createAdaptorRoleFaker = (next: RandomSource) => {
  const random = createRandomHelper(next);
  return (data?: Partial<AdaptorRole>) => {
    return {
      id: random.nextSnowflake(),
      name: random.nextString(10),
      color: random.nextColor(),
      hoist: false,
      icon: null,
      unicodeEmoji: null,
      position: 0,
      permissions: createAdaptorPermissionsDefaultAllowFaker()(),
      managed: false,
      mentionable: false,
      tags: null,
      ...data,
    } satisfies AdaptorRole;
  };
};

export const createAdaptorUserFaker = (next: RandomSource) => {
  const random = createRandomHelper(next);
  return (data?: Partial<AdaptorUser>) => {
    return {
      id: random.nextSnowflake(),
      username: random.nextString(10),
      discriminator: random.nextInt(0, 9999).toString().padStart(4, "0"),
      avatar: null,
      bot: false,
      system: false,
      mfaEnabled: false,
      banner: null,
      accentColor: random.nextColor(),
      flags: 0,
      ...data,
    } satisfies AdaptorUser;
  };
};
