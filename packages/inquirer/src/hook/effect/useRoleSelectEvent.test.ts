import { describe, expect, test, vi } from "vitest";

import { useRoleSelectEvent } from "./useRoleSelectEvent";
import {
  createAdaptorRoleMock,
  createAdaptorUserInvokedInteractionBaseMock,
  renderHook,
} from "../../testing";

import type { AdaptorRoleSelectInteraction } from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useRoleSelectEvent", () => {
  describe("useRoleSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useRoleSelectEvent("customId", handle)
      );

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

      emitInteraction(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        expect.arrayContaining([roles.roleIdA, roles.roleIdB]),
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useRoleSelectEvent("customId", handle)
      );

      emitInteraction({
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

      emitInteraction!({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "button",
          customId: "customId",
        },
      });

      expect(handle).not.toHaveBeenCalled();
    });
  });
});
