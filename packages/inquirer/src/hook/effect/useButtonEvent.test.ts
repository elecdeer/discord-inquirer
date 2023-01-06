import { describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";
import { useButtonEvent } from "./useButtonEvent";

import type {
  AdaptorButtonInteraction,
  AdaptorUserSelectInteraction,
} from "../../adaptor";

describe("packages/inquirer/src/hook/useButtonEvent", () => {
  describe("useButtonEvent()", () => {
    const interactionMock = {
      type: "messageComponent",
      id: "interactionId",
      token: "interactionToken",
      version: 1,
      user: {
        id: "userId",
        username: "username",
        discriminator: "discriminator",
        avatar: "avatar",
        bot: false,
        system: false,
        mfaEnabled: false,
        flags: 0,
        banner: null,
        accentColor: null,
      },
      member: null,
      guildId: null,
      channelId: "channelId",
      locale: "locale",
      guildLocale: null,
      applicationId: "applicationId",
      appPermissions: null,
      data: {
        componentType: "button",
        customId: "customId",
      },
    } as const satisfies AdaptorButtonInteraction;

    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useButtonEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        ...interactionMock,
      } satisfies AdaptorButtonInteraction);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
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

      useButtonEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        ...interactionMock,
        data: {
          ...interactionMock.data,
          customId: "customId2",
        },
      });

      adaptorMock.emitInteraction!({
        ...interactionMock,
        data: {
          ...interactionMock.data,
          componentType: "userSelect",
          values: ["value1", "value2"],
          resolved: {
            users: {},
            members: {},
          },
        },
      } satisfies AdaptorUserSelectInteraction);

      expect(handle).not.toHaveBeenCalled();

      controller.unmount();
    });
  });
});
