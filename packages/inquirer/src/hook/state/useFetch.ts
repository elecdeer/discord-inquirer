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

export const useFetch = <TKey, TData>(
  key: Lazy<TKey>,
  fetcher: (args: TKey) => Promise<TData>
): FetchState<TData> & {
  mutate: () => void;
} => {
  type CacheValue =
    | {
        data: TData;
        error: undefined;
      }
    | {
        data: undefined;
        error: Error;
      };

  //キャッシュのスコープはこのコンポーネントのみ
  const cache = useRef(new Map<string, CacheValue>());

  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<CacheValue | undefined>(undefined);

  const prevCacheKey = useRef<string>(keyToCacheKey(undefined));
  const resolvedKey = resolveLazy(key);
  const cacheKey = keyToCacheKey(resolvedKey);

  const revalidate = () => {
    fetcher(resolvedKey).then(
      (data) => {
        const value = {
          data,
          error: undefined,
        };
        cache.current.set(cacheKey, value);
        setIsLoading(false);
        setValue(value);
      },
      (error) => {
        const value = {
          data: undefined,
          error,
        };
        cache.current.set(cacheKey, value);
        setIsLoading(false);
        setValue(value);
      }
    );
  };

  const mutate = () => {
    cache.current.delete(cacheKey);
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
      const cacheValue = cache.current.get(cacheKey);
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

const keyToCacheKey = (key: unknown) => {
  return hash(key);
};
