import type { AdaptorUser } from "../adaptor";

export const createAdaptorUserMock = (
  values: Partial<AdaptorUser> = {}
): AdaptorUser => {
  return {
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
    ...values,
  };
};
