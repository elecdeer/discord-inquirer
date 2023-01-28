import { describe, expect, test, vi } from "vitest";

import { useMentionableSelectEvent } from "./useMentionableSelectEvent";
import {
  createAdaptorPartialMemberMock,
  createAdaptorRoleMock,
  createAdaptorUserInvokedInteractionBaseMock,
  createAdaptorUserMock,
  renderHook,
} from "../../testing";

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
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useMentionableSelectEvent("customId", handle)
      );

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
      emitInteraction(interactionMock);

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
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useMentionableSelectEvent("customId", handle)
      );

      emitInteraction({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId",
        },
      });

      emitInteraction({
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
    });
  });
});
