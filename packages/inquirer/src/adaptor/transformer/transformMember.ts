import { transformNullishDateString } from "./shared";

import type { AdaptorPartialMember } from "../structure";
import type { APIInteractionDataResolvedGuildMember } from "discord-api-types/v10";

const transformPartialMember = (
  member: APIInteractionDataResolvedGuildMember
): AdaptorPartialMember => {
  return {
    nick: member.nick ?? null,
    avatar: member.avatar ?? null,
    roles: member.roles,
    joinedAt: new Date(member.joined_at),
    premiumSince: transformNullishDateString(member.premium_since),
    pending: member.pending ?? false,
    permissions: member.permissions ?? null,
    communicationDisabledUntil: transformNullishDateString(
      member.communication_disabled_until
    ),
  };
};

export const transformersMember = {
  partialMember: transformPartialMember,
};
