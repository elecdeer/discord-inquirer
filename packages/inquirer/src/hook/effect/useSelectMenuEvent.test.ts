import { describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import { createDiscordAdaptorMock } from "../../mock";
import { useSelectMenuEvent } from "./useSelectMenuEvent";

import type { AdaptorStringSelectInteraction } from "../../adaptor";

describe("packages/inquirer/src/hook/useSelectMenuEvent", () => {
  describe("useSelectMenuEvent()", () => {
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
        componentType: "stringSelect",
        customId: "customId",
        values: ["value1", "value2"],
      },
    } satisfies AdaptorStringSelectInteraction;

    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useSelectMenuEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        ...interactionMock,
      } satisfies AdaptorStringSelectInteraction);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        ["value1", "value2"],
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

      useSelectMenuEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      adaptorMock.emitInteraction!({
        ...interactionMock,
        data: {
          componentType: "stringSelect",
          customId: "customIdUnMatch",
          values: [],
        },
      });

      adaptorMock.emitInteraction!({
        ...interactionMock,
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
