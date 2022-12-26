import { describe, expect, test } from "vitest";

import { createCurriedBuilder } from "./curriedBuilder";

describe("packages/inquirer/src/util/curriedBuilder", () => {
  describe("implementation", () => {
    type Foo = {
      foo: string;
      bar: number;
      baz?: string;
    };

    test("正しく値が設定される", () => {
      const builder = createCurriedBuilder<
        Foo,
        {
          result: Foo;
        }
      >((value) => ({
        result: value,
      }));

      const result = builder({
        foo: "foo",
      })({})({
        bar: 1,
      })();

      expect(result).toEqual({
        result: {
          foo: "foo",
          bar: 1,
        },
      });
    });

    test("呼び出し結果が独立している", () => {
      const builder = createCurriedBuilder<Foo>();

      const partial = builder({
        foo: "foo",
      });

      const fulfilledA = partial({
        bar: 1,
      });

      const fulfilledB = partial({
        bar: 2,
      });

      expect(fulfilledA()).toEqual({
        foo: "foo",
        bar: 1,
      });

      expect(fulfilledB()).toEqual({
        foo: "foo",
        bar: 2,
      });
    });
  });
});
