import { describe, expect, test, vi } from "vitest";

import { keyToCacheKey, useFetchExternalCache } from "./useFetch";
import { Deferred, renderHook } from "../../testing";

import type { CacheValue } from "./useFetch";

describe("packages/inquirer/src/hook/state/useFetch", () => {
  describe("useFetchExternalCache()", () => {
    test("レンダリング時にキャッシュが無い場合はfetcherが呼ばれ、状態が更新される", async () => {
      const fetcher = vi.fn(async () => "fooValue");
      const cache = new Map();

      const { result, waitFor } = await renderHook(() =>
        useFetchExternalCache("fooKey", fetcher, cache)
      );

      expect(fetcher).toBeCalledWith("fooKey");

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBe("fooValue");
    });

    test("レンダリング時にキャッシュがある場合はfetcherが呼ばれず、状態が更新される", async () => {
      const fetcher = vi.fn();
      const cache = new Map<string, CacheValue<string>>();
      cache.set(keyToCacheKey("fooKey"), {
        data: "fooValue",
        error: undefined,
      });

      const { result } = await renderHook(() =>
        useFetchExternalCache("fooKey", fetcher, cache)
      );

      expect(fetcher).not.toBeCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe("fooValue");
    });

    test("keyが変わったらそのkeyでfetcherが呼ばれる", async () => {
      const fetcher = vi.fn(async (key) =>
        key === "fooKey" ? "fooValue" : "barValue"
      );
      const cache = new Map();

      const { result, rerender, waitFor } = await renderHook(
        (key) => useFetchExternalCache(key, fetcher, cache),
        { initialArgs: "fooKey" }
      );

      expect(fetcher).toBeCalledWith("fooKey");
      expect(result.current.data).toBe("fooValue");

      await rerender({ newArgs: "barKey" });

      expect(fetcher).toBeCalledWith("barKey");
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBe("barValue");
    });

    test("fetcherが返すPromiseがresolveした場合はdataに値が入る", async () => {
      const deferred = new Deferred();
      const fetcher = vi.fn(() => deferred.promise);
      const cache = new Map();

      const { result, waitFor } = await renderHook(() =>
        useFetchExternalCache("fooKey", fetcher, cache)
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(undefined);
      expect(result.current.error).toBe(undefined);

      deferred.resolve("fooValue");

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBe("fooValue");
      expect(result.current.error).toBe(undefined);
    });

    test("fetcherが返すPromiseがrejectした場合はerrorにエラーが入る", async () => {
      const deferred = new Deferred();
      const fetcher = vi.fn(() => deferred.promise);
      const cache = new Map();

      const { result, waitFor } = await renderHook(() =>
        useFetchExternalCache("fooKey", fetcher, cache)
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBe(undefined);
      expect(result.current.error).toBe(undefined);

      deferred.reject("fooError");

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBe(undefined);
      expect(result.current.error).toBe("fooError");
    });

    test("keyがfalsyな場合はfetcherが呼ばれず、falsyのままであればdispatchもされない", async () => {
      const fetcher = vi.fn();
      const cache = new Map();

      let renderNum = 0;

      const { result } = await renderHook(() => {
        renderNum++;
        return useFetchExternalCache(null, fetcher, cache);
      });

      expect(renderNum).toBe(1);
      expect(fetcher).not.toBeCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe(undefined);
      expect(result.current.error).not.toBe(undefined);
    });

    test("fetch中に異なるキーでレンダリングが行われた際に古い結果で上書きされない", async () => {
      const fooDeferred = new Deferred();
      const barDeferred = new Deferred();

      const fetcher = vi.fn((key) =>
        key === "fooKey" ? fooDeferred.promise : barDeferred.promise
      );
      const cache = new Map();

      const { result, rerender, waitFor } = await renderHook(
        (key) => useFetchExternalCache(key, fetcher, cache),
        { initialArgs: "fooKey" }
      );

      expect(result.current.isLoading).toBe(true);
      await rerender({ newArgs: "barKey" });
      expect(result.current.isLoading).toBe(true);

      barDeferred.resolve("barValue");
      fooDeferred.resolve("fooValue");

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBe("barValue");
    });

    test("mutateを呼ぶとキャッシュが破棄された後fetcherが呼ばれ、settleされたら状態が更新される", async () => {
      let mockValue = "fooValue";
      const fetcher = vi.fn(async () => mockValue);

      const cache = new Map();
      const deleteSpy = vi.spyOn(cache, "delete");

      const { result, waitFor } = await renderHook(() =>
        useFetchExternalCache("fooKey", fetcher, cache)
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(cache.get(keyToCacheKey("fooKey"))?.data).toBe("fooValue");

      mockValue = "barValue";
      result.current.mutate();

      expect(deleteSpy).toBeCalledWith(keyToCacheKey("fooKey"));

      // mutateを呼んだ後でも、fetcherによる取得が終わるまでは前の値のまま
      expect(result.current.data).toBe("fooValue");
      expect(fetcher).toBeCalledWith("fooKey");

      await waitFor(() => {
        expect(result.current.data).toBe("barValue");
      });
    });
  });
});
