import { transformers } from "./index";
import { nullishThrough, transformNullishDateString } from "./shared";
import { adaptorMemberFlagsMap } from "../structure";

import type { AdaptorMemberFlag } from "../structure";
import type { AdaptorPartialMember } from "../structure";
import type { APIInteractionDataResolvedGuildMember } from "discord-api-types/v10";

const transformPartialMember = (
  member: APIInteractionDataResolvedGuildMember,
): AdaptorPartialMember => {
  return {
    nick: member.nick ?? null,
    avatar: member.avatar ?? null,
    roles: member.roles,
    joinedAt: new Date(member.joined_at),
    premiumSince: transformNullishDateString(member.premium_since),
    flag: transformers.memberFlag(member.flags),
    pending: member.pending ?? false,
    permissions:
      nullishThrough(transformers.permissionFlags)(member.permissions) ?? null,
    communicationDisabledUntil: transformNullishDateString(
      member.communication_disabled_until,
    ),
  };
};

const transformMemberFlag = (flags: number): AdaptorMemberFlag => {
  return {
    didRejoin: (flags & adaptorMemberFlagsMap.didRejoin) !== 0,
    completedOnboarding:
      (flags & adaptorMemberFlagsMap.completedOnboarding) !== 0,
    bypassesVerification:
      (flags & adaptorMemberFlagsMap.bypassesVerification) !== 0,
    startedVerification:
      (flags & adaptorMemberFlagsMap.startedVerification) !== 0,
  };
};

export const transformersMember = {
  partialMember: transformPartialMember,
  memberFlag: transformMemberFlag,
};
