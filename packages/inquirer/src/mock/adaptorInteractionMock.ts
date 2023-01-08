import { transformers } from "../adaptor";

import type { AdaptorUserInvokedInteractionBase } from "../adaptor";

export const createAdaptorUserInvokedInteractionMock = () => {
  return {
    id: "interactionIdValue",
    applicationId: "applicationIdValue",
    token: "tokenValue",
    version: 1,
    guildId: "guildIdValue",
    channelId: "channelIdValue",
    member: {
      nick: "nickValue",
      avatar: null,
      roles: [] as string[],
      joinedAt: new Date("2021-01-01T00:00:00.000Z"),
      premiumSince: null,
      pending: false,
      permissions: null,
      communicationDisabledUntil: null,
    },
    user: {
      id: "userIdValue",
      username: "usernameValue",
      discriminator: "0000",
      avatar: null,
      bot: false,
      system: false,
      mfaEnabled: false,
      banner: null,
      accentColor: null,
      flags: 0,
    },
    locale: "en-US",
    guildLocale: "en-US",
    appPermissions: transformers.permissionFlags(String((1n << 41n) - 1n)),
  } as const satisfies AdaptorUserInvokedInteractionBase<"guild">;
};
