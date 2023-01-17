import { describe, expect, test, vi } from "vitest";

import { useMentionableSelectEvent } from "./useMentionableSelectEvent";
import { createHookContext } from "../../core/hookContext";
import {
  createAdaptorPartialMemberMock,
  createAdaptorRoleMock,
  createAdaptorUserInvokedInteractionBaseMock,
  createAdaptorUserMock,
  createDiscordAdaptorMock,
} from "../../mock";

import type {
  AdaptorMentionableSelectInteraction,
  AdaptorPartialMember,
  AdaptorRole,
  AdaptorUser,
  Snowflake,
} from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useMentionableSelectEvent", () => {
  describe("useMentionableSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useMentionableSelectEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      const users = {
        userIdA: createAdaptorUserMock({ id: "userIdA" }),
      } satisfies Record<Snowflake, AdaptorUser>;
      const members = {
        userIdA: createAdaptorPartialMemberMock({ nick: "nickA" }),
      } satisfies Record<Snowflake, AdaptorPartialMember>;
      const roles = {
        roleIdA: createAdaptorRoleMock({ id: "roleIdA" }),
      } satisfies Record<Snowflake, AdaptorRole>;

      const interactionMock = {
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "mentionableSelect",
          customId: "customId",
          values: ["userIdA", "roleIdA"],
          resolved: {
            users,
            members,
            roles,
          },
        },
      } satisfies AdaptorMentionableSelectInteraction;
      adaptorMock.emitInteraction!(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        expect.arrayContaining([
          {
            type: "user",
            ...users.userIdA,
          },
          {
            type: "role",
            ...roles.roleIdA,
          },
        ]),
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);

      controller.unmount();
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useMentionableSelectEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId",
        },
      });

      adaptorMock.emitInteraction!({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "mentionableSelect",
          customId: "unmatchedCustomId",
          values: ["roleIdA"],
          resolved: {
            users: {},
            members: {},
            roles: {
              roleIdA: createAdaptorRoleMock({ id: "roleIdA" }),
            },
          },
        },
      } satisfies AdaptorMentionableSelectInteraction);

      expect(handle).not.toHaveBeenCalled();

      controller.unmount();
    });
  });
});
