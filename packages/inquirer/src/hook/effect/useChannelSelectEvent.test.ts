import { describe, expect, test, vi } from "vitest";

import { useChannelSelectEvent } from "./useChannelSelectEvent";
import {
  createAdaptorPartialNonThreadChannelMock,
  createAdaptorPartialThreadChannelBaseMock,
  createAdaptorUserInvokedInteractionBaseMock,
  renderHook,
} from "../../testing";

import type {
  AdaptorChannelSelectInteraction,
  AdaptorPartialChannel,
  Snowflake,
} from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useChannelSelectEvent", () => {
  describe("useChannelSelectEvent()", () => {
    test("customIdやtypeが一致した際にhandlerが呼ばれる", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useChannelSelectEvent("customId", handle)
      );

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
      emitInteraction(interactionMock);

      expect(handle).toBeCalledWith(
        {
          ...interactionMock,
        },
        expect.arrayContaining([channels.channelIdA, channels.channelIdB]),
        expect.anything()
      );
      expect(handle).toBeCalledTimes(1);
    });

    test("customIdやtypeが一致していない場合はhandlerが呼ばれない", () => {
      const handle = vi.fn();
      const { emitInteraction } = renderHook(() =>
        useChannelSelectEvent("customId", handle)
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
    });
  });
});
