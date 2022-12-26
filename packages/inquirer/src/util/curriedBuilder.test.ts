import { describe, expect, test } from "vitest";

import { createBuilder } from "./curriedBuilder";

describe("packages/inquirer/src/util/curriedBuilder", () => {
  describe("implementation", () => {
    type Foo = {
      foo: string;
      bar: number;
      baz?: string;
    };

    const builder = createBuilder<
      Foo,
      {
        result: Foo;
      }
    >((value) => ({
      result: value,
    }));

    test("正しく値が設定される", () => {
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
  });
});
