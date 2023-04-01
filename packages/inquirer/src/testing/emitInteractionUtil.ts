import { adaptorFaker } from "./adaptorFaker";
import { InvalidInteractionError } from "../util/errors";
import { resolveLazy } from "../util/lazy";

import type {
  AdaptorButtonInteraction,
  AdaptorChannelSelectComponent,
  AdaptorChannelSelectInteraction,
  AdaptorInteraction,
  AdaptorInteractionResponseModalData,
  AdaptorMentionableSelectComponent,
  AdaptorMentionableSelectInteraction,
  AdaptorModalSubmitInteraction,
  AdaptorNonLinkButtonComponent,
  AdaptorPartialChannel,
  AdaptorPartialNonThreadChannel,
  AdaptorPartialThreadChannel,
  AdaptorRole,
  AdaptorRoleSelectComponent,
  AdaptorRoleSelectInteraction,
  AdaptorStringSelectComponent,
  AdaptorStringSelectInteraction,
  AdaptorUser,
  AdaptorUserSelectComponent,
  AdaptorUserSelectInteraction,
  Snowflake,
} from "../adaptor";
import type { Lazy } from "../util/lazy";
import type { RandomSource } from "../util/randomSource";
import type { Awaitable } from "../util/types";

type LazyOverrideParam<T> = Lazy<Readonly<Partial<T>>, Readonly<T>>;

export const createEmitInteractionTestUtil = (
  emitInteraction: (interaction: AdaptorInteraction) => Promise<void>,
  act: <T>(cb: () => Awaitable<T>, messageId?: string) => Promise<T>,
  randomSource: RandomSource
) => {
  const faker = adaptorFaker(randomSource);

  const emitButtonInteraction = async (
    customId: Snowflake,
    overrideParam?: LazyOverrideParam<AdaptorButtonInteraction>
  ) => {
    const mockInteraction: AdaptorButtonInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "messageComponent",
      data: {
        customId: customId,
        componentType: "button",
      },
    };
    const interaction = {
      ...mockInteraction,
      ...resolveLazy(overrideParam, mockInteraction),
    };

    await emitInteraction(interaction);
    return interaction;
  };

  const emitStringSelectInteraction = async (
    customId: Snowflake,
    values: readonly string[],
    overrideParam?: LazyOverrideParam<AdaptorStringSelectInteraction>
  ) => {
    const mockInteraction: AdaptorStringSelectInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "messageComponent",
      data: {
        customId: customId,
        componentType: "stringSelect",
        values: [...values],
      },
      ...overrideParam,
    };
    const interaction = {
      ...mockInteraction,
      ...resolveLazy(overrideParam, mockInteraction),
    };

    await emitInteraction(interaction);
    return interaction;
  };

  const emitUserSelectInteraction = async (
    customId: Snowflake,
    dummyUsers: number | readonly Partial<AdaptorUser>[],
    overrideParam?: LazyOverrideParam<AdaptorUserSelectInteraction>
  ) => {
    const userList = Array.isArray(dummyUsers)
      ? dummyUsers.map((user) => faker.user(user))
      : [...Array(dummyUsers)].map(() => faker.user());
    const members = Object.fromEntries(
      userList.map((user) => [user.id, faker.partialMember()])
    );
    const users = Object.fromEntries(userList.map((user) => [user.id, user]));

    const mockInteraction: AdaptorUserSelectInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "messageComponent",
      data: {
        customId: customId,
        componentType: "userSelect",
        values: userList.map((user) => user.id),
        resolved: {
          users: users,
          members: members,
        },
      },
      ...overrideParam,
    };
    const interaction = {
      ...mockInteraction,
      ...resolveLazy(overrideParam, mockInteraction),
    };

    await emitInteraction(interaction);
    return interaction;
  };

  const emitRoleSelectInteraction = async (
    customId: Snowflake,
    dummyRole: number | readonly Partial<AdaptorRole>[],
    overrideParam?: LazyOverrideParam<AdaptorRoleSelectInteraction>
  ) => {
    const roleList = Array.isArray(dummyRole)
      ? dummyRole.map((role) => faker.role(role))
      : [...Array(dummyRole)].map(() => faker.role());
    const roles = Object.fromEntries(roleList.map((role) => [role.id, role]));

    const mockInteraction: AdaptorRoleSelectInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "messageComponent",
      data: {
        customId: customId,
        componentType: "roleSelect",
        values: roleList.map((role) => role.id),
        resolved: {
          roles: roles,
        },
      },
      ...overrideParam,
    };
    const interaction = {
      ...mockInteraction,
      ...resolveLazy(overrideParam, mockInteraction),
    };

    await emitInteraction(interaction);
    return interaction;
  };

  const emitChannelSelectInteraction = async (
    customId: Snowflake,
    dummyChannelTypes: readonly (Partial<AdaptorPartialChannel> &
      Pick<AdaptorPartialChannel, "type">)[],
    overrideParam?: LazyOverrideParam<AdaptorChannelSelectInteraction>
  ) => {
    const channelList = dummyChannelTypes.map((channel) => {
      if (
        channel.type === "announcementThread" ||
        channel.type === "publicThread" ||
        channel.type === "privateThread"
      ) {
        return {
          type: channel.type,
          ...faker.partialThreadChannel(channel),
        } satisfies AdaptorPartialThreadChannel;
      } else {
        return {
          type: channel.type,
          ...faker.partialNonThreadChannel(channel),
        } satisfies AdaptorPartialNonThreadChannel;
      }
    });
    const channels = Object.fromEntries(
      channelList.map((channel) => [channel.id, channel])
    );

    const mockInteraction: AdaptorChannelSelectInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "messageComponent",
      data: {
        customId: customId,
        componentType: "channelSelect",
        values: channelList.map((channel) => channel.id),
        resolved: {
          channels: channels,
        },
      },
      ...overrideParam,
    };
    const interaction = {
      ...mockInteraction,
      ...resolveLazy(overrideParam, mockInteraction),
    };

    await emitInteraction(interaction);
    return interaction;
  };

  const emitMentionableSelectInteraction = async (
    customId: Snowflake,
    dummyMentionables: Readonly<
      (
        | ({
            type: "user";
          } & Partial<AdaptorUser>)
        | ({
            type: "role";
          } & Partial<AdaptorRole>)
      )[]
    >,
    overrideParam?: LazyOverrideParam<AdaptorMentionableSelectInteraction>
  ) => {
    const userList = dummyMentionables
      .filter((mentionable) => mentionable.type === "user")
      .map((value) => faker.user(value as Partial<AdaptorUser>));
    const roleList = dummyMentionables
      .filter((mentionable) => mentionable.type === "role")
      .map((value) => faker.role(value as Partial<AdaptorRole>));
    const mentionableList = [...userList, ...roleList];

    const users = Object.fromEntries(userList.map((user) => [user.id, user]));
    const roles = Object.fromEntries(roleList.map((role) => [role.id, role]));
    const members = Object.fromEntries(
      userList.map((user) => [user.id, faker.partialMember()])
    );

    const mockInteraction: AdaptorMentionableSelectInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "messageComponent",
      data: {
        customId: customId,
        componentType: "mentionableSelect",
        values: mentionableList.map((mentionable) => mentionable.id),
        resolved: {
          users,
          members,
          roles,
        },
      },
      ...overrideParam,
    };
    const interaction = {
      ...mockInteraction,
      ...resolveLazy(overrideParam, mockInteraction),
    };

    await emitInteraction(interaction);
    return interaction;
  };

  const emitModalInteraction = async (
    customId: Snowflake,
    fields: Readonly<Record<string, string>>,
    overrideParam?: LazyOverrideParam<AdaptorModalSubmitInteraction>
  ) => {
    const mockInteraction: AdaptorModalSubmitInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "modalSubmit",
      data: {
        customId: customId,
        fields: fields,
      },
      ...overrideParam,
    };
    const interaction = {
      ...mockInteraction,
      ...resolveLazy(overrideParam, mockInteraction),
    };

    await emitInteraction(interaction);
    return interaction;
  };

  const clickButtonComponent = async (
    component: AdaptorNonLinkButtonComponent,
    overrideParam?: LazyOverrideParam<AdaptorButtonInteraction>
  ) => {
    const customId = component.customId;
    if (component.disabled) {
      throw new InvalidInteractionError("button is disabled");
    }
    return act(() => emitButtonInteraction(customId, overrideParam));
  };

  const assertSelectEmit = (
    component: Readonly<{
      disabled?: boolean;
      maxValues?: number;
      minValues?: number;
    }>,
    selectNum: number
  ) => {
    if (component.disabled) {
      throw new InvalidInteractionError("select component is disabled");
    }
    if (component.maxValues !== undefined && component.maxValues < selectNum) {
      throw new InvalidInteractionError("too many items");
    }
    if (component.minValues !== undefined && component.minValues > selectNum) {
      throw new InvalidInteractionError("too few items");
    }
  };

  const selectStringSelectComponent = async <T>(
    component: Readonly<AdaptorStringSelectComponent<T>>,
    values: string[],
    overrideParam?: LazyOverrideParam<AdaptorStringSelectInteraction>
  ) => {
    const customId = component.customId;
    assertSelectEmit(component, values.length);

    const capableValues = component.options.map((option) => option.value);
    values.forEach((value) => {
      if (!capableValues.includes(value)) {
        throw new InvalidInteractionError(
          `not includes in component.options: ${value}`
        );
      }
    });

    return act(() =>
      emitStringSelectInteraction(customId, values, overrideParam)
    );
  };

  const selectUserSelectComponent = async (
    component: Readonly<AdaptorUserSelectComponent>,
    dummyUsers: number | readonly Partial<AdaptorUser>[],
    overrideParam?: LazyOverrideParam<AdaptorUserSelectInteraction>
  ) => {
    const customId = component.customId;
    const dummyUserNum = Array.isArray(dummyUsers)
      ? dummyUsers.length
      : (dummyUsers as number);
    assertSelectEmit(component, dummyUserNum);

    return act(() =>
      emitUserSelectInteraction(customId, dummyUsers, overrideParam)
    );
  };

  const selectRoleSelectComponent = async (
    component: Readonly<AdaptorRoleSelectComponent>,
    dummyRoles: number | readonly Partial<AdaptorRole>[],
    overrideParam?: LazyOverrideParam<AdaptorRoleSelectInteraction>
  ) => {
    const customId = component.customId;
    const dummyRoleNum = Array.isArray(dummyRoles)
      ? dummyRoles.length
      : (dummyRoles as number);
    assertSelectEmit(component, dummyRoleNum);

    return act(() =>
      emitRoleSelectInteraction(customId, dummyRoles, overrideParam)
    );
  };

  const selectChannelSelectComponent = async (
    component: Readonly<AdaptorChannelSelectComponent>,
    dummyChannels: readonly (Partial<AdaptorPartialChannel> &
      Pick<AdaptorPartialChannel, "type">)[],
    overrideParam?: LazyOverrideParam<AdaptorChannelSelectInteraction>
  ) => {
    const customId = component.customId;
    assertSelectEmit(component, dummyChannels.length);

    if (component.channelTypes !== undefined) {
      const capableChannelTypes = component.channelTypes;
      dummyChannels.forEach(({ type }) => {
        if (!capableChannelTypes.includes(type)) {
          throw new InvalidInteractionError(
            `not includes in component.channelTypes: ${type}`
          );
        }
      });
    }

    return act(() =>
      emitChannelSelectInteraction(customId, dummyChannels, overrideParam)
    );
  };

  const selectMentionableSelectComponent = async (
    component: Readonly<AdaptorMentionableSelectComponent>,
    dummyMentionables: Readonly<
      (
        | ({
            type: "user";
          } & Partial<AdaptorUser>)
        | ({
            type: "role";
          } & Partial<AdaptorRole>)
      )[]
    >,
    overrideParam?: LazyOverrideParam<AdaptorMentionableSelectInteraction>
  ) => {
    const customId = component.customId;
    assertSelectEmit(component, dummyMentionables.length);

    return act(() =>
      emitMentionableSelectInteraction(
        customId,
        dummyMentionables,
        overrideParam
      )
    );
  };

  const confirmModal = async (
    responseData: Readonly<AdaptorInteractionResponseModalData>,
    fields: Readonly<Record<string, string>>,
    overrideParam?: LazyOverrideParam<AdaptorModalSubmitInteraction>
  ) => {
    const customId = responseData.customId;

    const elements = responseData.components.flatMap((row) => row.components);

    Object.entries(fields).forEach(([elemCustomId, value]) => {
      const elem = elements.find((elem) => elem.customId === elemCustomId);
      if (!elem) {
        throw new InvalidInteractionError(`not found element: ${elemCustomId}`);
      }
      if (elem.minLength !== undefined && value.length < elem.minLength) {
        throw new InvalidInteractionError(
          `too short value: ${value} customId: ${elemCustomId}`
        );
      }
      if (elem.maxLength !== undefined && value.length > elem.maxLength) {
        throw new InvalidInteractionError(
          `too long value: ${value} customId: ${elemCustomId}`
        );
      }
    });

    elements
      .filter((elem) => elem.required)
      .forEach((elem) => {
        if (fields[elem.customId] === undefined) {
          throw new InvalidInteractionError(
            `required element not found: ${elem.customId}`
          );
        }
      });

    return act(() => emitModalInteraction(customId, fields, overrideParam));
  };

  return {
    emitInteraction,
    emitButtonInteraction,
    emitStringSelectInteraction,
    emitUserSelectInteraction,
    emitRoleSelectInteraction,
    emitChannelSelectInteraction,
    emitMentionableSelectInteraction,
    clickButtonComponent,
    selectStringSelectComponent,
    selectUserSelectComponent,
    selectRoleSelectComponent,
    selectChannelSelectComponent,
    selectMentionableSelectComponent,
    confirmModal,
  };
};
