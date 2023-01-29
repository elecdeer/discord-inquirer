import { describe, expect, test } from "vitest";

import { useStringSelectComponent } from "./useStringSelectComponent";
import { renderHook } from "../../testing";

import type { PartialStringSelectItem } from "./useStringSelectComponent";

describe("packages/inquirer/src/hook/render/useStringSelectComponent", () => {
  describe("useRoleSelectComponent()", () => {
    test("", () => {
      const options = [
        {
          payload: 0,
          label: "0",
        },
        {
          payload: 1,
          label: "1",
        },
        {
          payload: 2,
          label: "2",
        },
      ] satisfies PartialStringSelectItem<number>[];

      const { result } = renderHook(
        () => useStringSelectComponent({ options }),
        {}
      );

      expect(result.current[0]).toMatchObject([
        {
          payload: 0,
          label: "0",
          selected: false,
        },
        {
          payload: 1,
          label: "1",
          selected: false,
        },
        {
          payload: 2,
          label: "2",
          selected: false,
        },
      ]);

      expect(result.current[1]()).toEqual({
        type: "stringSelect",
        customId: expect.any(String),
        options: [
          expect.objectContaining({
            value: expect.any(String),
            label: "0",
            default: false,
          }),
          expect.objectContaining({
            value: expect.any(String),
            label: "1",
            default: false,
          }),
          expect.objectContaining({
            value: expect.any(String),
            label: "2",
            default: false,
          }),
        ],
      });

      // expect(result.current[0]).to
    });
  });
});
