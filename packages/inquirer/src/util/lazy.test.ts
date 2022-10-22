import { describe, expect, test } from "vitest";

import { resolveLazy } from "./lazy";

describe("packages/inquirer/src/util/lazy", () => {
  describe("resolveLazy()", () => {
    test("プリミティブな値", () => {
      expect(resolveLazy(0)).toBe(0);
      expect(resolveLazy(true)).toBe(true);
      expect(resolveLazy("str")).toEqual("str");
    });

    test("valueなしの関数", () => {
      expect(resolveLazy(() => 0)).toBe(0);
      expect(resolveLazy(() => true)).toBe(true);
      expect(resolveLazy(() => "str")).toBe("str");

      const func = () => "ret";
      expect(resolveLazy(() => func)).toBe(func);
    });

    test("valueありの関数", () => {
      expect(resolveLazy((value) => value, 0)).toBe(0);
      expect(resolveLazy((value) => value, true)).toBe(true);
      expect(resolveLazy((value) => value, "str")).toBe("str");

      const func = () => "ret";
      expect(resolveLazy((value) => value, func)).toBe(func);
    });
  });
});
