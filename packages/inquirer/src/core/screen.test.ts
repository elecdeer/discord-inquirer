import { describe, expect, test } from "vitest";

import { createMessagePayloadPatch } from "./screen";

import type { MessageMutualPayload } from "../adaptor/messageFacade";

describe("packages/inquirer/src/core/screen", () => {
  describe("createMessagePayloadPatch()", () => {
    test("値に違いがある場合は新しい値を返す", () => {
      const prev: MessageMutualPayload = {
        content: "prevContent",
        embeds: [
          {
            title: "prevEmbedTitle1",
            description: "prevEmbedDescription2",
          },
          {
            title: "prevEmbedTitle2",
            description: "prevEmbedDescription2",
          },
        ],
        components: [
          {
            type: "row",
            components: [
              {
                type: "button",
                label: "prevButton1",
                style: "primary",
                customId: "prevCustomId1",
              },
            ],
          },
        ],
        allowedMentions: {
          everyone: false,
          users: true,
        },
        suppressEmbeds: false,
      };

      const next: MessageMutualPayload = {
        content: "nextContent",
        embeds: [
          {
            title: "nextEmbedTitle1",
            description: "nextEmbedDescription2",
          },
          {
            title: "nextEmbedTitle2",
            description: "nextEmbedDescription2",
          },
        ],
        components: [
          {
            type: "row",
            components: [
              {
                type: "button",
                label: "nextButton1",
                style: "primary",
                customId: "nextCustomId1",
              },
            ],
          },
        ],
        allowedMentions: {
          everyone: true,
          users: false,
        },
        suppressEmbeds: true,
      };

      const result = createMessagePayloadPatch(prev, next);
      expect(result).toEqual({
        content: "nextContent",
        embeds: [
          {
            title: "nextEmbedTitle1",
            description: "nextEmbedDescription2",
          },
          {
            title: "nextEmbedTitle2",
            description: "nextEmbedDescription2",
          },
        ],
        components: [
          {
            type: "row",
            components: [
              {
                type: "button",
                label: "nextButton1",
                style: "primary",
                customId: "nextCustomId1",
              },
            ],
          },
        ],
        allowedMentions: {
          everyone: true,
          users: false,
        },
        suppressEmbeds: true,
      });
    });

    test("値に違いがない場合はnullを返す", () => {
      const prev: MessageMutualPayload = {
        content: "prevContent",
        embeds: [
          {
            title: "prevEmbedTitle1",
            description: "prevEmbedDescription2",
          },
          {
            title: "prevEmbedTitle2",
            description: "prevEmbedDescription2",
          },
        ],
        components: [
          {
            type: "row",
            components: [
              {
                type: "button",
                label: "prevButton1",
                style: "primary",
                customId: "prevCustomId1",
              },
            ],
          },
        ],
        allowedMentions: {
          everyone: false,
          users: true,
        },
        suppressEmbeds: false,
      };

      const next: MessageMutualPayload = {
        content: "prevContent",
        embeds: [
          {
            title: "prevEmbedTitle1",
            description: "prevEmbedDescription2",
          },
          {
            title: "prevEmbedTitle2",
            description: "prevEmbedDescription2",
          },
        ],
        components: [
          {
            type: "row",
            components: [
              {
                type: "button",
                label: "prevButton1",
                style: "primary",
                customId: "prevCustomId1",
              },
            ],
          },
        ],
        allowedMentions: {
          everyone: false,
          users: true,
        },
        suppressEmbeds: false,
      };

      const result = createMessagePayloadPatch(prev, next);
      expect(result).toEqual(null);
    });

    test("embedの順序を入れ替えた場合は差分ありとして返す", () => {
      const embed1 = {
        title: "embedTitle1",
        description: "embedDescription1",
      };
      const embed2 = {
        title: "embedTitle2",
        description: "embedDescription2",
      };

      const prev: MessageMutualPayload = {
        embeds: [embed1, embed2],
      };

      const next: MessageMutualPayload = {
        embeds: [embed2, embed1],
      };

      const result = createMessagePayloadPatch(prev, next);
      expect(result).toEqual({
        embeds: [embed2, embed1],
      });
    });
  });
});
