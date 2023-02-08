import assert from "node:assert";
import { vi } from "vitest";

import { createDiscordAdaptorMock } from "./discordAdaptorMock";
import { createEmitInteractionTestUtil } from "./emitInteractionUtil";
import {
  createHookCycle,
  deferDispatch,
  deferDispatchAsync,
} from "../core/hookContext";
import { createRandomSource } from "../util/randomSource";
import { createTimer } from "../util/timer";

import type { AdaptorMock } from "./discordAdaptorMock";
import type { HookCycle } from "../core/hookContext";

// implements reference: https://github.com/testing-library/react-hooks-testing-library/blob/c7a2e979fb8a51271d0d3032c7a03b6fb6ebd3e6/src/core/index.ts

export type RenderHookOptions<TArgs> = {
  initialArgs?: TArgs;
  adaptor?: AdaptorMock;
  randomSource?: () => number;
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

export const renderHook = <TResult, TArgs>(
  runHook: (args: TArgs) => TResult,
  options?: RenderHookOptions<TArgs>
) => {
  const {
    initialArgs = undefined,
    adaptor = createDiscordAdaptorMock(),
    randomSource = createRandomSource(23),
  } = options ?? {};

  const { result, setValue, setError, addResolver } = resultContainer();
  let args = initialArgs;

  const hookCycle = createHookCycle(
    adaptor,
    vi.fn(() => {
      //dispatchを呼ぶ可能性のある操作をする場合はactで囲う必要がある
      console.warn(
        "any function call that may call dispatch must be enclosed in act"
      );
      console.trace("");
    })
  );

  const renderer = testRenderer(() => {
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
  }, hookCycle);

  let latestMessageId = getRandomMessageId();
  renderer.render(latestMessageId);

  const actAsync = async <T = void>(
    cb: () => Promise<T>,
    messageId?: string
  ): Promise<T> => {
    latestMessageId = messageId ?? latestMessageId;
    return await renderer.actAsync(cb, latestMessageId);
  };

  const act = <T>(cb: () => T, messageId?: string): T => {
    latestMessageId = messageId ?? latestMessageId;
    return renderer.act(cb, latestMessageId);
  };

  const interactionHelper = createEmitInteractionTestUtil(
    adaptor.emitInteraction,
    actAsync,
    randomSource
  );

  return {
    result: result as {
      current: TResult;
    },
    rerender: (param?: { messageId?: string; newArgs?: TArgs }) => {
      args = param?.newArgs ?? args;
      latestMessageId = param?.messageId ?? latestMessageId;
      renderer.rerender(latestMessageId);
    },
    unmount: () => {
      renderer.unmount();
    },
    act: act,
    actAsync: actAsync,
    adaptorMock: adaptor,
    interactionHelper: interactionHelper,
    ...asyncUtil(actAsync, addResolver),
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

      if (timeoutTimer.isTimeout()) throw new Error("timeout");
    }
  };

  const waitForNextUpdate = async ({ timeout = 1000 } = {}) => {
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error("timeout"));
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

const testRenderer = (cb: () => void, hookCycle: HookCycle) => {
  const renderIndexRecord: {
    current: number | undefined;
    history: number[];
  } = {
    current: undefined,
    history: [],
  };
  const pushRenderIndex = (renderIndex: number) => {
    renderIndexRecord.history.push(renderIndex);
    renderIndexRecord.current = renderIndex;
  };

  const renderCb = (): number => {
    const renderIndex = hookCycle.startRender();

    const context = hookCycle.context;
    const { dispatched } = deferDispatch(context, () => {
      cb();
    });

    hookCycle.endRender();

    if (dispatched) {
      return renderCb();
    } else {
      return renderIndex;
    }
  };

  const render = (messageId: string) => {
    const renderIndex = renderCb();
    pushRenderIndex(renderIndex);

    hookCycle.mount(renderIndex, messageId);
  };

  const rerender = (messageId: string) => {
    const renderIndex = renderCb();

    assert(renderIndexRecord.current !== undefined);
    hookCycle.unmount(renderIndexRecord.current);

    pushRenderIndex(renderIndex);

    hookCycle.mount(renderIndex, messageId);
  };

  const unmount = () => {
    assert(renderIndexRecord.current !== undefined);
    hookCycle.unmount(renderIndexRecord.current);
  };

  const act = <T = void>(cb: () => T, messageId: string) => {
    const context = hookCycle.context;
    const { dispatched, result } = deferDispatch(context, () => cb());

    if (dispatched) {
      rerender(messageId);
    }

    return result;
  };

  const actAsync = async <T = void>(
    cb: () => Promise<T>,
    messageId: string
  ): Promise<T> => {
    const context = hookCycle.context;

    //cbの間で更になにか割り込まれるとまずいかも
    const { dispatched, result } = await deferDispatchAsync(
      context,
      async () => await cb()
    );

    if (dispatched) {
      rerender(messageId);
    }

    return result;
  };

  return {
    render,
    rerender,
    unmount,
    act,
    actAsync,
  };
};

const getRandomMessageId = () => {
  //19桁の10進数の文字列を生成
  return Math.floor(Math.random() * 10 ** 19).toString();
};
