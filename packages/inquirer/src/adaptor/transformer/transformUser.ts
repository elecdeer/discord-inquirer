import type { AdaptorUser } from "../structure";
import type { APIUser } from "discord-api-types/v10";
import type { ReadonlyDeep } from "type-fest";

const transformUser = (user: APIUser): ReadonlyDeep<AdaptorUser> => {
  return {
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    bot: user.bot ?? false,
    system: user.system ?? false,
    mfaEnabled: user.mfa_enabled ?? false,
    banner: user.banner ?? null,
    accentColor: user.accent_color ?? null,
    flags: user.flags ?? 0,
  };
};

export const transformersUser = {
  user: transformUser,
};
