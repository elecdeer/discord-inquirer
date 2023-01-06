import { describe, expect, test } from "vitest";

import { reverseRecord } from "./reverseRecord";

describe("packages/inquirer/src/util/reverseRecord", () => {
  describe("正しく動作する", () => {
    test("keyがstringのとき", () => {
      const symbol = Symbol("symValue");

      const record = {
        str: "strValue",
        num: 1.2,
        sym: symbol,
      } as const;

      const reversed = reverseRecord(record);
      expect(reversed).toEqual({
        strValue: "str",
        1.2: "num",
        [symbol]: "sym",
      });

      expect(reverseRecord(reversed)).toEqual(record);
    });

    test("keyがpropertyKeyのとき", () => {
      const symbol = Symbol("symbol");

      const record = {
        foo: "strValue",
        1: "numValue",
        [symbol]: "symValue",
      } as const;
      const reversed = reverseRecord(record);
      expect(reversed).toEqual({
        strValue: "foo",
        numValue: 1,
        symValue: symbol,
      });

      expect(reverseRecord(reversed)).toEqual(record);
    });
  });
});
