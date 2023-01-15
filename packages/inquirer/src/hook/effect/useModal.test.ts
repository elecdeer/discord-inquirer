import { describe, expect, test, vi } from "vitest";

import { createHookContext } from "../../core/hookContext";
import {
  createAdaptorUserInvokedInteractionBaseMock,
  createDiscordAdaptorMock,
} from "../../mock";
import { useModal } from "./useModal";

import type {
  AdaptorInteractionResponse,
  AdaptorInteractionResponseDeferredUpdate,
  AdaptorInteractionResponseModal,
  DiscordAdaptor,
} from "../../adaptor";

describe("packages/inquirer/src/hook/effect/useModal", () => {
  describe("useModal()", () => {
    test("openを呼んだときにinteractionが返信される", () => {
      const adaptorMock = createDiscordAdaptorMock();
      const controller = createHookContext(adaptorMock, vi.fn());

      controller.startRender();
      const [_, open] = useModal({
        title: "title",
        components: [
          {
            key: "key",
            style: "short",
            label: "label",
          },
        ],
      });
      controller.endRender();
      controller.mount("messageId");

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

      const controller = createHookContext(adaptorMock, vi.fn());

      const onSubmit = vi.fn();

      //初回render
      controller.startRender();
      const [resultInitial, open] = useModal({
        title: "title",
        components: [
          {
            key: "bar",
            style: "short",
            label: "label",
          },
        ],
        onSubmit: onSubmit,
      });
      expect(resultInitial).toBe(null);
      controller.endRender();
      controller.mount("messageId");

      //モーダルを開く
      open("interactionId", "interactionToken");

      //sendInteractionResponseは非同期なのでそれが完了するまで待つ必要がある
      await new Promise((resolve) => setTimeout(resolve, 1));

      //開かれたモーダルの回答が送信された
      adaptorMock.emitInteraction({
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

      controller.startRender();
      const [result] = useModal({
        title: "title",
        components: [
          {
            key: "bar",
            style: "short",
            label: "label",
          },
        ],
        onSubmit: onSubmit,
      });
      expect(result).toEqual({
        bar: "value",
      });
      controller.endRender();
      controller.update("messageId");

      expect(onSubmit).toBeCalledWith({
        bar: "value",
      });
    });
  });
});
