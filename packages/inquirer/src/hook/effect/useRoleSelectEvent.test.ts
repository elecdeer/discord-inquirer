import { describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import {
  createAdaptorRoleMock,
  createAdaptorUserInvokedInteractionBaseMock,
  createDiscordAdaptorMock,
} from "../../mock";
import { useRoleSelectEvent } from "./useRoleSelectEvent";

import type { AdaptorRoleSelectInteraction } from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useRoleSelectEvent", () => {
  describe("useRoleSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useRoleSelectEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      const roles = {
        roleIdA: createAdaptorRoleMock({ id: "roleIdA" }),
        roleIdB: createAdaptorRoleMock({ id: "roleIdB" }),
      };
      const interactionMock = {
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "roleSelect",
          customId: "customId",
          values: ["roleIdA", "roleIdB"],
          resolved: {
            roles,
          },
        },
      } satisfies AdaptorRoleSelectInteraction;

      adaptorMock.emitInteraction!(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        expect.arrayContaining([roles.roleIdA, roles.roleIdB]),
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

      useRoleSelectEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "roleSelect",
          customId: "unmatchedCustomId",
          values: ["roleIdA"],
          resolved: {
            roles: {
              roleIdA: createAdaptorRoleMock({ id: "roleIdA" }),
            },
          },
        },
      });

      adaptorMock.emitInteraction!({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId",
        },
      });

      expect(handle).not.toHaveBeenCalled();

      controller.unmount();
    });
  });
});
