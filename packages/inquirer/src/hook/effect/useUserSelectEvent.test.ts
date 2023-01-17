import { describe, expect, test, vi } from "vitest";

import { useUserSelectEvent } from "./useUserSelectEvent";
import { createHookContext } from "../../core/hookContext";
import {
  createAdaptorPartialMemberMock,
  createAdaptorUserInvokedInteractionBaseMock,
  createAdaptorUserMock,
  createDiscordAdaptorMock,
} from "../../mock";

import type { AdaptorUserSelectInteraction } from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useUserSelectEvent", () => {
  describe("useUserSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useUserSelectEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

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
      adaptorMock.emitInteraction!(interactionMock);

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

      controller.unmount();
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useUserSelectEvent("customId", handle);

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

      controller.unmount();
    });
  });
});
