import { transformers } from "../adaptor";

import type { AdaptorPermissions } from "../adaptor";

export const createAdaptorPermissionsMockDefaultAllow = (
  values: Partial<AdaptorPermissions> = {}
): AdaptorPermissions => {
  return {
    ...transformers.permissionFlags(String((1n << 41n) - 1n)),
    ...values,
  };
};

export const createAdaptorPermissionsMockDefaultDeny = (
  values: Partial<AdaptorPermissions> = {}
): AdaptorPermissions => {
  return {
    ...transformers.permissionFlags("0"),
    ...values,
  };
};
