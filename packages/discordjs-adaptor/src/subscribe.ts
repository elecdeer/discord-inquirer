import { adaptorChannelTypesMap } from "discord-inquirer";
import { ChannelType } from "discord.js";
import assert from "node:assert";

import type {
  AdaptorPartialChannel,
  AdaptorPartialChannelBase,
  AdaptorPartialThreadChannel,
  AdaptorRoleTags,
  AdaptorInteraction,
  AdaptorInteractionUserSelect,
  AdaptorPartialMember,
  AdaptorRole,
  AdaptorThreadMetadata,
  AdaptorUser,
  DiscordAdaptor,
  Snowflake,
} from "discord-inquirer";
import type {
  APIChannel,
  APIGuildMember,
  APIInteractionDataResolvedGuildMember,
  APIThreadMetadata,
  Channel,
  Client,
  Collection,
  GuildMember,
  Interaction,
  Role,
  RoleTagData,
  User,
  APIRole,
  APIRoleTags,
} from "discord.js";

export const subscribeInteraction =
  (client: Client<true>): DiscordAdaptor["subscribeInteraction"] =>
  (handler) => {
    const listener = (interaction: Interaction) => {
      const adaptorInteraction = convertToAdaptorInteraction(interaction);
      console.log(adaptorInteraction);
      handler(adaptorInteraction);
    };

    // client.ws.on(GatewayDispatchEvents.InteractionCreate, (data, shardId) => {
    //   console.log("raw Event", { data, shardId });
    //   console.log(JSON.stringify(data, null, "\t"));
    // });

    client.on("interactionCreate", listener);

    return () => {
      client.off("interactionCreate", listener);
    };
  };

const convertToAdaptorInteraction = (
  djsInteraction: Interaction
): AdaptorInteraction => {
  const base = {
    id: djsInteraction.id,
    token: djsInteraction.token,
    userId: djsInteraction.user.id,
    channelId: djsInteraction.channelId ?? undefined,
    guildId: djsInteraction.guildId ?? undefined,
  };

  if (djsInteraction.isMessageComponent()) {
    if (djsInteraction.isButton()) {
      return {
        ...base,
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: djsInteraction.customId,
        },
      };
    }

    if (djsInteraction.isStringSelectMenu()) {
      return {
        ...base,
        type: "messageComponent",
        data: {
          componentType: "stringSelect",
          customId: djsInteraction.customId,
          values: djsInteraction.values,
        },
      };
    }

    if (djsInteraction.isUserSelectMenu()) {
      const users = transformUserCollection(djsInteraction.users);
      const members = djsInteraction.inCachedGuild()
        ? transformCachedMemberCollection(djsInteraction.members)
        : djsInteraction.inRawGuild()
        ? transformRawMemberCollection(djsInteraction.members)
        : {};

      return {
        ...base,
        type: "messageComponent",
        data: {
          componentType: "userSelect",
          customId: djsInteraction.customId,
          values: djsInteraction.values,
          resolved: {
            users: users,
            members: members,
          },
        },
      } satisfies AdaptorInteractionUserSelect;
    }

    if (djsInteraction.isChannelSelectMenu()) {
      const channels = djsInteraction.inCachedGuild()
        ? transformCachedChannelCollection(djsInteraction.channels)
        : djsInteraction.inRawGuild()
        ? transformRawChannelCollection(djsInteraction.channels)
        : {};

      return {
        ...base,
        type: "messageComponent",
        data: {
          componentType: "channelSelect",
          customId: djsInteraction.customId,
          values: djsInteraction.values,
          resolved: {
            channels: channels,
          },
        },
      };
    }

    if (djsInteraction.isRoleSelectMenu()) {
      const roles = djsInteraction.inCachedGuild()
        ? transformCachedRoleCollection(djsInteraction.roles)
        : djsInteraction.inRawGuild()
        ? transformRawRoleCollection(djsInteraction.roles)
        : {};

      return {
        ...base,
        type: "messageComponent",
        data: {
          componentType: "roleSelect",
          customId: djsInteraction.customId,
          values: djsInteraction.values,
          resolved: {
            roles: roles,
          },
        },
      };
    }

    if (djsInteraction.isMentionableSelectMenu()) {
      const users = transformUserCollection(djsInteraction.users);
      const members = djsInteraction.inCachedGuild()
        ? transformCachedMemberCollection(djsInteraction.members)
        : djsInteraction.inRawGuild()
        ? transformRawMemberCollection(djsInteraction.members)
        : {};
      const roles = djsInteraction.inCachedGuild()
        ? transformCachedRoleCollection(djsInteraction.roles)
        : djsInteraction.inRawGuild()
        ? transformRawRoleCollection(djsInteraction.roles)
        : {};

      return {
        ...base,
        type: "messageComponent",
        data: {
          componentType: "mentionableSelect",
          customId: djsInteraction.customId,
          values: djsInteraction.values,
          resolved: {
            users: users,
            members: members,
            roles: roles,
          },
        },
      };
    }
  }

  if (djsInteraction.isModalSubmit()) {
    const fields = djsInteraction.fields.fields.reduce((acc, com, customId) => {
      acc[customId] = com.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      ...base,
      type: "modalSubmit",
      data: {
        customId: djsInteraction.customId,
        fields: fields,
      },
    };
  }

  throw new Error("unreachable");
};

const transformUserCollection = (
  collection: Collection<Snowflake, User>
): Record<Snowflake, AdaptorUser> => {
  return Object.fromEntries(
    collection.map((u) => {
      return [u.id, transformUser(u)];
    })
  );
};

const transformCachedRoleCollection = (
  collection: Collection<Snowflake, Role>
): Record<Snowflake, AdaptorRole> => {
  return Object.fromEntries(
    collection.map((r) => {
      return [r.id, transformCachedRole(r)];
    })
  );
};

const transformRawRoleCollection = (
  collection: Collection<Snowflake, APIRole>
): Record<Snowflake, AdaptorRole> => {
  return Object.fromEntries(
    collection.map((r) => {
      return [r.id, transformRawRole(r)];
    })
  );
};

const transformCachedMemberCollection = (
  collection: Collection<Snowflake, GuildMember>
): Record<Snowflake, AdaptorPartialMember> => {
  return Object.fromEntries(
    collection.map((m) => {
      return [m.id, transformCachedMember(m)];
    })
  );
};

const transformRawMemberCollection = (
  collection: Collection<Snowflake, APIGuildMember>
): Record<Snowflake, AdaptorPartialMember> => {
  return Object.fromEntries(
    collection.map((m, id) => {
      return [id, transformRawMember(m)];
    })
  );
};

const transformCachedChannelCollection = (
  collection: Collection<Snowflake, Channel>
): Record<Snowflake, AdaptorPartialChannel> => {
  return Object.fromEntries(
    collection.map((c) => {
      return [c.id, transformCachedChannel(c)];
    })
  );
};

const transformRawChannelCollection = (
  collection: Collection<Snowflake, APIChannel>
): Record<Snowflake, AdaptorPartialChannel> => {
  return Object.fromEntries(
    collection.map((c, id) => {
      return [id, transformRawChannel(c)];
    })
  );
};

const transformUser = (djsUser: User): AdaptorUser => {
  return {
    id: djsUser.id,
    username: djsUser.username,
    discriminator: djsUser.discriminator,
    avatar: djsUser.avatar,
    bot: djsUser.bot,
    system: djsUser.system,
    mfaEnabled: false,
    banner: djsUser.banner ?? null,
    accentColor: djsUser.accentColor ?? null,
    flags: djsUser.flags?.valueOf() ?? 0,
  };
};

const transformCachedMember = (
  djsMember: GuildMember
): AdaptorPartialMember => {
  /*
   discordJsのGuildMemberRoleManagerはguildのエンドポイントからRoleデータ全体を取得している
   ここで取得したいのはroleのidだけなので内部メンバにアクセスする
   https://github.com/discordjs/discord.js/blob/main/packages/discord.js/src/structures/GuildMember.js
   */

  const roles =
    "_roles" in djsMember && Array.isArray(djsMember._roles)
      ? (djsMember._roles as string[])
      : [];

  return {
    nick: djsMember.nickname,
    avatar: djsMember.avatar,
    roles: roles,
    joinedAt: djsMember.joinedAt!,
    premiumSince: djsMember.premiumSince ?? null,
    pending: djsMember.pending,
    permissions: djsMember.permissions.bitfield.toString(),
    communicationDisabledUntil: djsMember.communicationDisabledUntil ?? null,
  };
};

const transformRawMember = (
  djsMember: APIGuildMember
): AdaptorPartialMember => {
  //Discord.jsの型定義ミスか？
  const permissions = (
    djsMember as unknown as APIInteractionDataResolvedGuildMember
  ).permissions;
  if (permissions === undefined) {
    console.warn(
      "packages/discordjs-adaptor/src/subscribe.ts transformRawMember() permissions is undefined!"
    );
  }

  return {
    nick: djsMember.nick ?? null,
    avatar: djsMember.avatar ?? null,
    roles: djsMember.roles,
    joinedAt: new Date(djsMember.joined_at),
    premiumSince: transformNullableDateString(djsMember.premium_since),
    pending: djsMember.pending ?? false,
    permissions: permissions,
    communicationDisabledUntil: transformNullableDateString(
      djsMember.communication_disabled_until
    ),
  };
};

const transformNullableDateString = (
  dateStr: string | null | undefined
): Date | null => {
  if (dateStr === undefined || dateStr === null) return null;
  return new Date(dateStr);
};

const transformCachedRole = (djsRole: Role): AdaptorRole => {
  return {
    id: djsRole.id,
    name: djsRole.name,
    color: djsRole.color,
    hoist: djsRole.hoist,
    icon: djsRole.icon,
    unicodeEmoji: djsRole.unicodeEmoji,
    position: djsRole.position,
    permissions: djsRole.permissions.bitfield.toString(),
    managed: djsRole.managed,
    mentionable: djsRole.mentionable,
    tags: djsRole.tags ? transformCachedRoleTag(djsRole.tags) : null,
  };
};

const transformRawRole = (djsRole: APIRole): AdaptorRole => {
  return {
    id: djsRole.id,
    name: djsRole.name,
    color: djsRole.color,
    hoist: djsRole.hoist,
    icon: djsRole.icon ?? null,
    unicodeEmoji: djsRole.unicode_emoji ?? null,
    position: djsRole.position,
    permissions: djsRole.permissions,
    managed: djsRole.managed,
    mentionable: djsRole.mentionable,
    tags: djsRole.tags ? transformRawRoleTag(djsRole.tags) : null,
  };
};

const transformCachedRoleTag = (djsRole: RoleTagData): AdaptorRoleTags => {
  return {
    botId: djsRole.botId ?? null,
    integrationId: djsRole.integrationId ?? null,
    premiumSubscriber: djsRole.premiumSubscriberRole ?? null,
  };
};

const transformRawRoleTag = (djsRole: APIRoleTags): AdaptorRoleTags => {
  return {
    botId: djsRole.bot_id ?? null,
    integrationId: djsRole.integration_id ?? null,
    premiumSubscriber: djsRole.premium_subscriber ?? null,
  };
};

const transformRawChannel = (djsChannel: APIChannel): AdaptorPartialChannel => {
  const base: AdaptorPartialChannelBase = {
    id: djsChannel.id,
    name: djsChannel.name,
  };

  if (
    djsChannel.type === ChannelType.AnnouncementThread ||
    djsChannel.type === ChannelType.PublicThread ||
    djsChannel.type === ChannelType.PrivateThread
  ) {
    assert(djsChannel.parent_id);
    assert(djsChannel.thread_metadata);

    return {
      type: adaptorChannelTypesMap[djsChannel.type],
      ...base,
      parentId: djsChannel.parent_id,
      threadMetadata: transformThreadMetadata(djsChannel.thread_metadata),
    } satisfies AdaptorPartialThreadChannel;
  } else {
    return {
      type: adaptorChannelTypesMap[djsChannel.type],
      ...base,
    } satisfies AdaptorPartialChannel;
  }
};

const transformThreadMetadata = (
  djsThreadMetadata: APIThreadMetadata
): AdaptorThreadMetadata => {
  return {
    archived: djsThreadMetadata.archived,
    autoArchiveDuration: djsThreadMetadata.auto_archive_duration,
    archiveTimestamp: new Date(djsThreadMetadata.archive_timestamp),
    locked: djsThreadMetadata.locked ?? false,
    invitable: djsThreadMetadata.invitable ?? false,
    createdTimestamp: transformNullableDateString(
      djsThreadMetadata.create_timestamp
    ),
  };
};

const transformCachedChannel = (djsChannel: Channel): AdaptorPartialChannel => {
  if (djsChannel.isThread()) {
    assert(djsChannel.parentId);
    assert(djsChannel.autoArchiveDuration);
    assert(djsChannel.archiveTimestamp);
    assert(djsChannel.createdAt);

    return {
      type: adaptorChannelTypesMap[djsChannel.type],
      id: djsChannel.id,
      name: djsChannel.name,
      threadMetadata: {
        archived: djsChannel.archived ?? false,
        autoArchiveDuration: djsChannel.autoArchiveDuration,
        archiveTimestamp: new Date(djsChannel.archiveTimestamp),
        locked: djsChannel.locked ?? false,
        invitable: djsChannel.invitable ?? false,
        createdTimestamp: djsChannel.createdAt,
      },
      parentId: djsChannel.parentId!,
    };
  } else {
    return {
      id: djsChannel.id,
      name: "name" in djsChannel ? djsChannel.name : null,
      type: adaptorChannelTypesMap[djsChannel.type],
    };
  }
};
