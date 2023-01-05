import { adaptorPermissionFlagsMap } from "../structure";
import { transformers } from "./index";

import type {
  AdaptorRole,
  AdaptorPermissions,
  AdaptorRoleTags,
} from "../structure";
import type { APIRole, APIRoleTags } from "discord-api-types/v10";
import type { ReadonlyDeep } from "type-fest";

/**
 * bigint文字列を展開し、各フラグをキーとしたrecordを作成する
 */
const transformPermissionFlags = (
  permissions: string
): ReadonlyDeep<AdaptorPermissions> => {
  const flags = BigInt(permissions);

  const parsed: Record<string, boolean> = {};
  const entries = Object.entries(adaptorPermissionFlagsMap);
  for (const [key, value] of entries) {
    parsed[key] = Boolean(flags & value);
  }
  return parsed as AdaptorPermissions;
};

const transformRoleTag = (role: APIRoleTags): ReadonlyDeep<AdaptorRoleTags> => {
  return {
    botId: role.bot_id ?? null,
    integrationId: role.integration_id ?? null,
    premiumSubscriber: role.premium_subscriber ?? null,
  };
};

const transformRole = (role: APIRole): ReadonlyDeep<AdaptorRole> => {
  return {
    id: role.id,
    name: role.name,
    color: role.color,
    hoist: role.hoist,
    icon: role.icon ?? null,
    unicodeEmoji: role.unicode_emoji ?? null,
    position: role.position,
    permissions: transformers.permissionFlags(role.permissions),
    managed: role.managed,
    mentionable: role.mentionable,
    tags: role.tags ? transformers.roleTag(role.tags) : null,
  };
};

export const transformersRole = {
  role: transformRole,
  roleTag: transformRoleTag,
  permissionFlags: transformPermissionFlags,
};
