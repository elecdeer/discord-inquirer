import { useRef } from "./useRef";
import { useState } from "./useState";
import { hash } from "../../util/hash";
import { resolveLazy } from "../../util/lazy";

import type { Lazy } from "../../util/lazy";

export type FetchState<T> =
  | {
      isLoading: true;
      error?: undefined;
      data?: undefined;
    }
  | {
      isLoading: false;
      error: Error;
      data?: undefined;
    }
  | {
      isLoading: false;
      error?: undefined;
      data: T;
    };

export type UseFetchCache<T> = {
  set: (key: string, value: T) => void;
  get: (key: string) => T | undefined;
  delete: (key: string) => void;
};

export type CacheValue<T> =
  | {
      data: T;
      error: undefined;
    }
  | {
      data: undefined;
      error: Error;
    };

export type UseFetchResult<TData> = FetchState<TData> & {
  mutate: () => void;
};

export const useFetchExternalCache = <TKey, TData>(
  key: Lazy<TKey | undefined | null>,
  fetcher: (args: TKey) => Promise<TData>,
  cache: UseFetchCache<CacheValue<TData>>
): UseFetchResult<TData> => {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<CacheValue<TData> | undefined>(undefined);

  const prevCacheKey = useRef<string>(keyToCacheKey(undefined));
  const resolvedKey = resolveLazy(key);
  const cacheKey = keyToCacheKey(resolvedKey);

  const revalidate = () => {
    fetcher(resolvedKey!).then(
      (data) => {
        const value = {
          data,
          error: undefined,
        };
        cache.set(cacheKey, value);

        //既にkeyが変わっている
        if (cacheKey !== prevCacheKey.current) return;
        setIsLoading(false);
        setValue(value);
      },
      (error) => {
        const value = {
          data: undefined,
          error,
        };
        cache.set(cacheKey, value);

        //既にkeyが変わっている
        if (cacheKey !== prevCacheKey.current) return;
        setIsLoading(false);
        setValue(value);
      }
    );
  };

  const mutate = () => {
    cache.delete(cacheKey);
    revalidate();
  };

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const isKeyFalsy = !resolvedKey;

  if (prevCacheKey.current !== cacheKey) {
    prevCacheKey.current = cacheKey;

    //keyが変わった
    if (isKeyFalsy) {
      //どちらも変更が無ければdispatchは走らない
      setIsLoading(false);
      setValue(undefined);
    } else {
      const cacheValue = cache.get(cacheKey);
      if (cacheValue !== undefined) {
        //キャッシュがある
        setIsLoading(false);
        setValue(cacheValue);
      } else {
        //キャッシュがない
        setIsLoading(true);
        setValue(undefined);
        revalidate();
      }
    }
  }

  if (isLoading) {
    return {
      isLoading: true,
      mutate,
    };
  }
  if (value === undefined) {
    //keyがfalsyの場合 isLoadingがfalseであってもdataもerrorもundefinedになる
    return {
      isLoading: false,
      error: new Error("key is falsy"),
      mutate,
    };
  }
  return {
    isLoading: false,
    ...value,
    mutate,
  };
};

/**
 * キーに対応するデータを非同期に取得するためのhook
 * 同じキーに対応するデータはキャッシュされる
 * useFetchを使う限り、キャッシュはhook呼び出し単位で保持される
 * useFetchExternalCacheを使うと、キャッシュを外部で管理できる
 * @param key
 * @param fetcher
 */
export const useFetch = <TKey, TData>(
  key: Lazy<TKey | undefined | null>,
  fetcher: (args: TKey) => Promise<TData>
): UseFetchResult<TData> => {
  const cacheRef = useRef(new Map<string, CacheValue<TData>>());

  const cache: UseFetchCache<CacheValue<TData>> = {
    set: (key, value) => {
      cacheRef.current.set(key, value);
    },
    get: (key) => {
      return cacheRef.current.get(key);
    },
    delete: (key) => {
      cacheRef.current.delete(key);
    },
  };

  return useFetchExternalCache<TKey, TData>(key, fetcher, cache);
};

export const keyToCacheKey = (key: unknown) => {
  return hash(key);
};
