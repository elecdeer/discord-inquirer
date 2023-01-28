import { describe, expect, test, vi } from "vitest";

import { useModal } from "./useModal";
import {
  createAdaptorUserInvokedInteractionBaseMock,
  createDiscordAdaptorMock,
  renderHook,
} from "../../testing";

import type {
  AdaptorInteractionResponse,
  AdaptorInteractionResponseDeferredUpdate,
  AdaptorInteractionResponseModal,
  DiscordAdaptor,
} from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useModal", () => {
  describe("useModal()", () => {
    test("openを呼んだときにinteractionが返信される", () => {
      const { result, adaptorMock } = renderHook(() =>
        useModal({
          title: "title",
          components: [
            {
              key: "key",
              style: "short",
              label: "label",
            },
          ],
        })
      );

      const [_, open] = result.current;

      open("interactionId", "interactionToken");

      expect(adaptorMock.sendInteractionResponse).toBeCalledWith(
        "interactionId",
        "interactionToken",
        {
          type: "modal",
          data: {
            title: "title",
            customId: expect.any(String),
            components: [
              {
                type: "row",
                components: [
                  {
                    type: "textInput",
                    customId: expect.any(String),
                    style: "short",
                    label: "label",
                  },
                ],
              },
            ],
          },
        } satisfies AdaptorInteractionResponse
      );
    });

    test("modalが投稿された時にdeferUpdateが返信され、resultが更新されonSubmitが呼ばれる", async () => {
      //interactionが返信されたらここにその内容が入る
      let sentInteractionResponse: AdaptorInteractionResponseModal | undefined;
      const adaptorMock = {
        ...createDiscordAdaptorMock(),
        sendInteractionResponse: vi.fn(async (_, __, response) => {
          sentInteractionResponse = response as AdaptorInteractionResponseModal;
        }),
      } satisfies DiscordAdaptor;

      const onSubmit = vi.fn();

      const { result, emitInteraction, rerender } = renderHook(
        () =>
          useModal({
            title: "title",
            components: [
              {
                key: "bar",
                style: "short",
                label: "label",
              },
            ],
            onSubmit: onSubmit,
          }),
        {
          adaptor: adaptorMock,
        }
      );

      const [resultInitial, open] = result.current;
      expect(resultInitial).toBe(null);

      //モーダルを開く
      open("interactionId", "interactionToken");

      //sendInteractionResponseは非同期なのでそれが完了するまで待つ必要がある
      await new Promise((resolve) => setTimeout(resolve, 1));

      //開かれたモーダルの回答が送信された
      emitInteraction({
        ...createAdaptorUserInvokedInteractionBaseMock(),
        type: "modalSubmit",
        id: "modalSubmitResponseInteractionId",
        token: "modalSubmitResponseInteractionToken",
        data: {
          customId: sentInteractionResponse!.data.customId,
          fields: {
            [sentInteractionResponse!.data.components[0].components[0]
              .customId]: "value",
          },
        },
      });

      //modalSubmitに対してdeferredUpdateが返信される
      expect(adaptorMock.sendInteractionResponse).toBeCalledWith(
        "modalSubmitResponseInteractionId",
        "modalSubmitResponseInteractionToken",
        {
          type: "deferredUpdateMessage",
        } satisfies AdaptorInteractionResponseDeferredUpdate
      );

      rerender();

      expect(result.current[0]).toEqual({
        bar: "value",
      });

      expect(onSubmit).toBeCalledWith({
        bar: "value",
      });
    });
  });
});
