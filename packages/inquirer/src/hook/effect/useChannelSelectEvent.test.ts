import { describe, expect, test, vi } from "vitest";

import { useChannelSelectEvent } from "./useChannelSelectEvent";
import { createHookCycle } from "../../core/hookContext";
import {
  createAdaptorPartialNonThreadChannelMock,
  createAdaptorPartialThreadChannelBaseMock,
  createAdaptorUserInvokedInteractionBaseMock,
  createDiscordAdaptorMock,
} from "../../mock";

import type {
  AdaptorChannelSelectInteraction,
  AdaptorPartialChannel,
  Snowflake,
} from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useChannelSelectEvent", () => {
  describe("useChannelSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookCycle(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useChannelSelectEvent("customId", handle);

      controller.mount("messageId");
      controller.endRender();

      const channels = {
        channelIdA: {
          ...createAdaptorPartialNonThreadChannelMock(),
          type: "guildText",
        },
        channelIdB: {
          ...createAdaptorPartialThreadChannelBaseMock(),
          type: "publicThread",
        },
      } satisfies Record<Snowflake, AdaptorPartialChannel>;

      const interactionMock = {
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "messageComponent",
        data: {
          componentType: "channelSelect",
          customId: "customId",
          values: ["channelIdA", "channelIdB"],
          resolved: {
            channels,
          },
        },
      } satisfies AdaptorChannelSelectInteraction;
      adaptorMock.emitInteraction!(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        expect.arrayContaining([channels.channelIdA, channels.channelIdB]),
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);

      controller.unmount();
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookCycle(adaptorMock, vi.fn());
      const handle = vi.fn();

      controller.startRender();

      useChannelSelectEvent("customId", handle);

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
          componentType: "channelSelect",
          customId: "unmatchedCustomId",
          values: ["channelIdA"],
          resolved: {
            channels: {
              channelIdA: {
                ...createAdaptorPartialNonThreadChannelMock(),
                type: "guildText",
              },
            },
          },
        },
      } satisfies AdaptorChannelSelectInteraction);

      expect(handle).not.toHaveBeenCalled();

      controller.unmount();
    });
  });
});
