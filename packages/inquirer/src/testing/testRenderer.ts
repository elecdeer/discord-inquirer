import assert from "node:assert";
import { vi } from "vitest";

import { createDiscordAdaptorMock } from "./discordAdaptorMock";
import { createEmitInteractionTestUtil } from "./emitInteractionUtil";
import { createHookCycle, deferDispatch } from "../core/hookContext";
import { createRandomSource } from "../util/randomSource";

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
  };

  return {
    result,
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

  const { result, setValue, setError } = resultContainer();
  let args = initialArgs;

  const hookCycle = createHookCycle(
    adaptor,
    vi.fn(() => {
      // noop
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

  const interactionHelper = createEmitInteractionTestUtil(
    adaptor.emitInteraction,
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
    act: (cb: () => void, messageId?: string) => {
      latestMessageId = messageId ?? latestMessageId;
      renderer.act(cb, latestMessageId);
    },
    actAsync: async (cb: () => Promise<void>, messageId?: string) => {
      latestMessageId = messageId ?? latestMessageId;
      await renderer.actAsync(cb, latestMessageId);
    },
    adaptorMock: adaptor,
    interactionHelper: interactionHelper,
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
    const dispatched = deferDispatch(context, () => {
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

  const act = (cb: () => void, messageId: string) => {
    const context = hookCycle.context;
    const dispatched = deferDispatch(context, () => {
      cb();
    });
    if (dispatched) {
      rerender(messageId);
    }
  };

  const actAsync = async (cb: () => Promise<void>, messageId: string) => {
    const context = hookCycle.context;
    const prevDispatch = context.dispatch;
    let dispatched = false;

    context.dispatch = () => {
      dispatched = true;
    };
    //ここで更になにか割り込まれるとまずいかも
    await cb();
    context.dispatch = prevDispatch;

    if (dispatched) {
      rerender(messageId);
    }
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
