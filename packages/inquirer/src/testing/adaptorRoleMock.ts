import { createAdaptorPermissionsMockDefaultAllow } from "./adaptorPermissionMock";

import type { AdaptorRole } from "../adaptor";

export const createAdaptorRoleMock = (
  values: Partial<AdaptorRole> = {}
): AdaptorRole => {
  return {
    id: "roleIdValue",
    name: "roleNameValue",
    color: 0xff0000,
    hoist: false,
    icon: null,
    unicodeEmoji: null,
    position: 0,
    permissions: createAdaptorPermissionsMockDefaultAllow(),
    managed: false,
    mentionable: false,
    tags: null,
    ...values,
  };
};
