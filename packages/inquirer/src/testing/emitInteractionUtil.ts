import { adaptorFaker } from "./adaptorFaker";

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
import type { RandomSource } from "../util/randomSource";

export const createEmitInteractionTestUtil = (
  emitInteraction: (interaction: AdaptorInteraction) => void,
  randomSource: RandomSource
) => {
  const faker = adaptorFaker(randomSource);

  const emitButtonInteraction = (
    customId: Snowflake,
    overrideParam?: Readonly<Partial<AdaptorButtonInteraction>>
  ) => {
    const interaction: AdaptorButtonInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "messageComponent",
      data: {
        customId: customId,
        componentType: "button",
      },
      ...overrideParam,
    };
    emitInteraction(interaction);
    return interaction;
  };

  const emitStringSelectInteraction = (
    customId: Snowflake,
    values: readonly string[],
    overrideParam?: Readonly<Partial<AdaptorStringSelectInteraction>>
  ) => {
    const interaction: AdaptorStringSelectInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "messageComponent",
      data: {
        customId: customId,
        componentType: "stringSelect",
        values: [...values],
      },
      ...overrideParam,
    };
    emitInteraction(interaction);
    return interaction;
  };

  const emitUserSelectInteraction = (
    customId: Snowflake,
    dummyUsers: number | readonly Partial<AdaptorUser>[],
    overrideParam?: Readonly<Partial<AdaptorUserSelectInteraction>>
  ) => {
    const userList = Array.isArray(dummyUsers)
      ? dummyUsers.map((user) => faker.user(user))
      : [...Array(dummyUsers)].map(() => faker.user());
    const members = Object.fromEntries(
      userList.map((user) => [user.id, faker.partialMember()])
    );
    const users = Object.fromEntries(userList.map((user) => [user.id, user]));

    const interaction: AdaptorUserSelectInteraction = {
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
    emitInteraction(interaction);
    return interaction;
  };

  const emitRoleSelectInteraction = (
    customId: Snowflake,
    dummyRole: number | readonly Partial<AdaptorRole>[],
    overrideParam?: Readonly<Partial<AdaptorRoleSelectInteraction>>
  ) => {
    const roleList = Array.isArray(dummyRole)
      ? dummyRole.map((role) => faker.role(role))
      : [...Array(dummyRole)].map(() => faker.role());
    const roles = Object.fromEntries(roleList.map((role) => [role.id, role]));

    const interaction: AdaptorRoleSelectInteraction = {
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
    emitInteraction(interaction);
    return interaction;
  };

  const emitChannelSelectInteraction = (
    customId: Snowflake,
    dummyChannelTypes: readonly (Partial<AdaptorPartialChannel> &
      Pick<AdaptorPartialChannel, "type">)[],
    overrideParam?: Readonly<Partial<AdaptorChannelSelectInteraction>>
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

    const interaction: AdaptorChannelSelectInteraction = {
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
    emitInteraction(interaction);
    return interaction;
  };

  const emitMentionableSelectInteraction = (
    customId: Snowflake,
    dummyMentionables: (
      | ({
          type: "user";
        } & Partial<AdaptorUser>)
      | ({
          type: "role";
        } & Partial<AdaptorRole>)
    )[],
    overrideParam?: Readonly<Partial<AdaptorMentionableSelectInteraction>>
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

    const interaction: AdaptorMentionableSelectInteraction = {
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
    emitInteraction(interaction);
    return interaction;
  };

  const clickButtonComponent = (
    component: AdaptorNonLinkButtonComponent,
    overrideParam?: Partial<AdaptorButtonInteraction>
  ) => {
    const customId = component.customId;
    if (component.disabled) {
      throw new InvalidInteractionError("button is disabled");
    }
    return emitButtonInteraction(customId, overrideParam);
  };

  const emitModalInteraction = (
    customId: Snowflake,
    fields: Readonly<Record<string, string>>,
    overrideParam?: Readonly<Partial<AdaptorModalSubmitInteraction>>
  ) => {
    const interaction: AdaptorModalSubmitInteraction = {
      ...faker.userInvokedInteractionBase(),
      type: "modalSubmit",
      data: {
        customId: customId,
        fields: fields,
      },
      ...overrideParam,
    };

    emitInteraction(interaction);
    return interaction;
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
      throw new InvalidInteractionError("role select is disabled");
    }
    if (component.maxValues !== undefined && component.maxValues < selectNum) {
      throw new InvalidInteractionError("too many roles");
    }
    if (component.minValues !== undefined && component.minValues > selectNum) {
      throw new InvalidInteractionError("too few roles");
    }
  };

  const selectStringSelectComponent = <T>(
    component: Readonly<AdaptorStringSelectComponent<T>>,
    values: string[],
    overrideParam?: Readonly<Partial<AdaptorStringSelectInteraction>>
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

    return emitStringSelectInteraction(customId, values, overrideParam);
  };

  const selectUserSelectComponent = (
    component: Readonly<AdaptorUserSelectComponent>,
    dummyUsers: number | readonly Partial<AdaptorUser>[],
    overrideParam?: Readonly<Partial<AdaptorUserSelectInteraction>>
  ) => {
    const customId = component.customId;
    const dummyUserNum = Array.isArray(dummyUsers)
      ? dummyUsers.length
      : (dummyUsers as number);
    assertSelectEmit(component, dummyUserNum);

    return emitUserSelectInteraction(customId, dummyUserNum, overrideParam);
  };

  const selectRoleSelectComponent = (
    component: Readonly<AdaptorRoleSelectComponent>,
    dummyRoles: number | readonly Partial<AdaptorRole>[],
    overrideParam?: Readonly<Partial<AdaptorRoleSelectInteraction>>
  ) => {
    const customId = component.customId;
    const dummyRoleNum = Array.isArray(dummyRoles)
      ? dummyRoles.length
      : (dummyRoles as number);
    assertSelectEmit(component, dummyRoleNum);

    return emitRoleSelectInteraction(customId, dummyRoleNum, overrideParam);
  };

  const selectChannelSelectComponent = (
    component: Readonly<AdaptorChannelSelectComponent>,
    dummyChannels: readonly (Partial<AdaptorPartialChannel> &
      Pick<AdaptorPartialChannel, "type">)[],
    overrideParam?: Readonly<Partial<AdaptorChannelSelectInteraction>>
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

    return emitChannelSelectInteraction(customId, dummyChannels, overrideParam);
  };

  const selectMentionableSelectComponent = (
    component: Readonly<AdaptorMentionableSelectComponent>,
    dummyMentionables: (
      | ({
          type: "user";
        } & Partial<AdaptorUser>)
      | ({
          type: "role";
        } & Partial<AdaptorRole>)
    )[],
    overrideParam?: Readonly<Partial<AdaptorMentionableSelectInteraction>>
  ) => {
    const customId = component.customId;
    assertSelectEmit(component, dummyMentionables.length);

    return emitMentionableSelectInteraction(
      customId,
      dummyMentionables,
      overrideParam
    );
  };

  const confirmModal = (
    responseData: Readonly<AdaptorInteractionResponseModalData>,
    fields: Readonly<Record<string, string>>,
    overrideParam?: Readonly<Partial<AdaptorModalSubmitInteraction>>
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

    return emitModalInteraction(customId, fields, overrideParam);
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

export class InvalidInteractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInteractionError";
  }
}