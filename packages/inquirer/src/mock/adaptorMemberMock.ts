import type { AdaptorPartialMember } from "../adaptor";

export const createAdaptorPartialMemberMock = (
  values: Partial<AdaptorPartialMember> = {}
): AdaptorPartialMember => {
  return {
    nick: "nickValue",
    avatar: null,
    roles: [],
    joinedAt: new Date("2021-01-01T00:00:00.000Z"),
    premiumSince: null,
    pending: false,
    permissions: null,
    communicationDisabledUntil: null,
    ...values,
  };
};
