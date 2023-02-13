import { describe, expect, test, vi } from "vitest";

describe("packages/inquirer/src/hook/state/useFetch", () => {
  describe("useFetch()", () => {
    test.todo(
      "レンダリング時にキャッシュが無い場合はfetcherが呼ばれ、settleされたら状態が更新される",
      () => {
        //
      }
    );

    test.todo(
      "レンダリング時にキャッシュがある場合はfetcherが呼ばれず、状態が更新される",
      () => {
        //
      }
    );

    test.todo("fetcherが返すPromiseがresolveした場合はvalueに値が入る", () => {
      //
    });

    test.todo(
      "fetcherが返すPromiseがrejectした場合はerrorにエラーが入る",
      () => {
        //
      }
    );

    test.todo("keyがfalsyな場合はfetcherが呼ばれない", () => {
      //
    });

    test.todo(
      "mutateを呼ぶとキャッシュが破棄された後fetcherが呼ばれ、settleされたら状態が更新される",
      () => {
        //
      }
    );
  });
});
