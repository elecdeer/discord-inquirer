import { describe, expect, test } from "vitest";

import { useModalComponent } from "./useModalComponent";
import { renderHook } from "../../testing";

import type { AdaptorInteractionResponse } from "../../adaptor";

describe("packages/inquirer/src/hook/render/useModalComponent", () => {
  describe("useModalComponent()", () => {
    test("ボタンをクリックするとmodalが開く", async () => {
      const { result, interactionHelper, adaptorMock } = await renderHook(() =>
        useModalComponent({
          title: "title",
          components: [
            {
              style: "short",
              key: "foo",
              label: "foo",
            },
          ],
        }),
      );

      const component = result.current[1]({
        style: "primary",
      })();
      const interaction = await interactionHelper.clickButtonComponent(
        component,
      );

      expect(adaptorMock.sendInteractionResponse).toBeCalledWith(
        interaction.id,
        interaction.token,
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
                    label: "foo",
                  },
                ],
              },
            ],
          },
        } satisfies AdaptorInteractionResponse,
      );
    });

    test("filterでfalseを返したときはinteractionを無視する", async () => {
      const { result, adaptorMock, interactionHelper } = await renderHook(() =>
        useModalComponent({
          title: "title",
          components: [
            {
              style: "short",
              key: "foo",
              label: "foo",
            },
          ],
          filter: (interaction) => interaction.user.id === "foo",
        }),
      );

      const component = result.current[1]({
        style: "primary",
      })();

      await interactionHelper.clickButtonComponent(component);
      expect(adaptorMock.sendInteractionResponse).not.toHaveBeenCalled();

      await interactionHelper.clickButtonComponent(component, (base) => ({
        user: {
          ...base.user,
          id: "foo",
        },
      }));
      expect(adaptorMock.sendInteractionResponse).toHaveBeenCalled();
    });
  });
});
