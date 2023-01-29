import { describe, expect, test } from "vitest";

import { createRandomSource, nextSnowflake } from "./randomSource";

describe("packages/inquirer/src/util/randomSource", () => {
  describe("createRandomSource()", () => {
    test("seed値が同じなら同じ値を返す", () => {
      const seed = 3;
      const random1 = createRandomSource(seed);
      const random2 = createRandomSource(seed);
      expect(random1()).toBe(random2());
    });

    test("seed値が異なるなら異なる値を返す", () => {
      const seed1 = 3;
      const seed2 = 10;
      const random1 = createRandomSource(seed1);
      const random2 = createRandomSource(seed2);
      expect(random1()).not.toBe(random2());
    });
  });

  describe("nextSnowflakeId()", () => {
    test("19桁の文字列を返す", () => {
      const seed = 3;
      const randomSource = createRandomSource(seed);
      const generate = nextSnowflake(randomSource);
      for (let i = 0; i < 100; i++) {
        const id = generate();
        expect(id.length).toBe(19);
      }
    });
  });
});
