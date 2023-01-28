import { describe, expect, test, vi } from "vitest";

import { useUserSelectEvent } from "./useUserSelectEvent";
import {
  createAdaptorPartialMemberMock,
  createAdaptorUserInvokedInteractionBaseMock,
  createAdaptorUserMock,
  renderHook,
} from "../../testing";

import type { AdaptorUserSelectInteraction } from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useUserSelectEvent", () => {
  describe("useUserSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useUserSelectEvent("customId", handle)
      );

      const users = {
        userIdA: createAdaptorUserMock({ id: "userIdA" }),
        userIdB: createAdaptorUserMock({ id: "userIdB" }),
      };
      const members = {
        userIdA: createAdaptorPartialMemberMock({ nick: "nickA" }),
        userIdB: createAdaptorPartialMemberMock({ nick: "nickB" }),
      };

      const interactionMock = {
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "userSelect",
          customId: "customId",
          values: ["userIdA", "userIdB"],
          resolved: {
            users: users,
            members: members,
          },
        },
      } satisfies AdaptorUserSelectInteraction;
      emitInteraction(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        expect.arrayContaining([
          {
            ...users.userIdA,
            member: members.userIdA,
          },
          {
            ...users.userIdB,
            member: members.userIdB,
          },
        ]),
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useUserSelectEvent("customId", handle)
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
          componentType: "userSelect",
          customId: "unmatchedCustomId",
          values: ["userIdA"],
          resolved: {
            users: {
              userIdA: createAdaptorUserMock({ id: "userIdA" }),
            },
            members: {
              userIdA: createAdaptorPartialMemberMock({ nick: "nickA" }),
            },
          },
        },
      } satisfies AdaptorUserSelectInteraction);

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
