import { createDiscordAdaptorMock } from "./discordAdaptorMock";
import { createEmitInteractionTestUtil } from "./emitInteractionUtil";
import { createRenderer } from "../core/renderer";
import { TimeoutError } from "../util/errors";
import { defaultLogger } from "../util/logger";
import { createRandomHelper, createRandomSource } from "../util/randomSource";
import { createTimer } from "../util/timer";

import type { AdaptorMock } from "./discordAdaptorMock";
import type { Logger } from "../util/logger";
import type { Awaitable } from "../util/types";

// implements reference: https://github.com/testing-library/react-hooks-testing-library/blob/c7a2e979fb8a51271d0d3032c7a03b6fb6ebd3e6/src/core/index.ts

export type RenderHookOptions<TArgs> = {
  initialArgs?: TArgs;
  adaptor?: AdaptorMock;
  randomSource?: () => number;
  logger?: Logger;
};

type Result<V, E> =
  | {
      value: V;
      error?: undefined;
    }
  | {
      error: E;
      value?: undefined;
    };

const resultContainer = <T>() => {
  const results: Result<T, Error>[] = [];
  const resolvers: (() => void)[] = [];

  const result = {
    get all() {
      return results;
    },
    get current() {
      const result = results[results.length - 1];
      if (result.error !== undefined) {
        throw result.error;
      }
      return result.value;
    },
    get error() {
      const result = results[results.length - 1];
      return result.error;
    },
  };

  const updateResult = (result: Result<T, Error>) => {
    results.push(result);

    resolvers.splice(0, resolvers.length).forEach((resolve) => resolve());
  };

  return {
    result,
    addResolver: (resolver: () => void) => {
      resolvers.push(resolver);
    },
    setValue: (value: T) => updateResult({ value }),
    setError: (error: Error) => updateResult({ error }),
  };
};

export const renderHook = async <TResult, TArgs>(
  runHook: (args: TArgs) => TResult,
  options?: RenderHookOptions<TArgs>
) => {
  const {
    initialArgs = undefined,
    adaptor = createDiscordAdaptorMock(),
    randomSource = createRandomSource(23),
    logger = defaultLogger,
  } = options ?? {};

  const { result, setValue, setError, addResolver } = resultContainer();
  let args = initialArgs;

  const random = createRandomHelper(randomSource);
  let latestMessageId = random.nextSnowflake();

  const renderer = createRenderer(
    () => {
      try {
        setValue(runHook(args as TArgs));
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(
            new Error("unexpected throw", {
              cause: e,
            })
          );
        }
      }
    },
    async () => {
      return latestMessageId;
    },
    adaptor,
    logger
  );

  const act = async <T>(
    cb: () => Awaitable<T>,
    messageId?: string
  ): Promise<T> => {
    latestMessageId = messageId ?? latestMessageId;
    return await renderer.act(cb);
  };

  const interactionHelper = createEmitInteractionTestUtil(
    adaptor.emitInteraction,
    act,
    randomSource
  );

  await renderer.act(() => {
    renderer.mount();
  });

  return {
    result: result as {
      current: TResult;
    },
    rerender: async (param?: { messageId?: string; newArgs?: TArgs }) => {
      args = param?.newArgs ?? args;
      latestMessageId = param?.messageId ?? latestMessageId;
      await renderer.act(() => {
        renderer.update();
      });
    },
    unmount: async () => {
      await renderer.act(() => {
        renderer.unmount();
      });
    },
    act: act,
    adaptorMock: adaptor,
    interactionHelper: interactionHelper,
    ...asyncUtil(act, addResolver),
  };
};

export const asyncUtil = (
  actAsync: (cb: () => Promise<void>, messageId?: string) => Promise<void>,
  addResolver: (resolver: () => void) => void
) => {
  const waitFor = async (
    cb: () => boolean | void,
    { timeout = 1000, interval = 5 } = {}
  ) => {
    const safeCb = () => {
      try {
        return cb();
      } catch (e) {
        return false;
      }
    };

    const timeoutTimer = createTimer(timeout);

    const waitDispatchOrIntervalOrTimeout = (interval: number) => {
      return new Promise<void>((resolve) => {
        addResolver(() => {
          intervalTimer.dispose();
          resolve();
        });

        const intervalTimer = createTimer(interval);
        intervalTimer.onTimeout(() => {
          resolve();
        });

        timeoutTimer.onTimeout(() => {
          intervalTimer.dispose();
          resolve();
        });
      });
    };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (safeCb() !== false) {
        timeoutTimer.dispose();
        return;
      }

      //waitForで待っている間にdispatchが呼ばれる可能性があるのでactで囲う
      await actAsync(async () => {
        await waitDispatchOrIntervalOrTimeout(interval);
      });

      if (timeoutTimer.isTimeout()) throw new TimeoutError("waitFor timeout");
    }
  };

  const waitForNextUpdate = async ({ timeout = 1000 } = {}) => {
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError("waitForNextUpdate timeout"));
      }, timeout);
    });

    const updatePromise = new Promise<void>((resolve) => {
      addResolver(resolve);
    });

    await actAsync(async () => {
      await Promise.race([timeoutPromise, updatePromise]);
    });
  };

  return {
    waitFor,
    waitForNextUpdate,
  };
};
