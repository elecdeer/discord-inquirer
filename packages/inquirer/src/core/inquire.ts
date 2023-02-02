import { createEventFlow } from "@elecdeer/event-flow";

import { createHookCycle, deferDispatch, getHookContext } from "./hookContext";
import { isMatchHash } from "../util/hash";
import { defaultLogger } from "../util/logger";
import { createTimer } from "../util/timer";

import type { Screen } from "./screen";
import type { DiscordAdaptor, MessageMutualPayload } from "../adaptor";
import type { Logger } from "../util/logger";
import type { IEventFlowHandler } from "@elecdeer/event-flow";
import type { UnionToIntersection } from "type-fest";

type InquireResult<T extends Record<string, unknown>> = {
  resultEvent: IEventFlowHandler<
    {
      [K in keyof T]: {
        key: K;
        value: T[K];
        all: Partial<T>;
      };
    }[keyof T]
  >;

  result: () => Partial<T>;

  close: () => Promise<void>;
};

export type Inquire<T extends Record<string, unknown>> = (
  prompt: Prompt<T>,
  config: InquireConfig<T>
) => InquireResult<T>;

interface InquireConfig<T extends Record<string, unknown>> {
  screen: Screen;
  adaptor: DiscordAdaptor;

  defaultResult?: Partial<T>;

  /**
   * 最初にinquirerを送信してからタイムアウトするまでの時間
   * tokenの有効期限が15分なので最大でもそれより短くする
   * @default 14.5 * 60 * 1000 ms
   */
  time?: number;

  /**
   * 最後に回答状態かコンポーネントの状態が変化してからタイムアウトするまでの時間
   * @default 2 ** 31 - 1 ms
   */
  idle?: number;

  log?: Logger;
}

export type Prompt<T extends Record<string, unknown>> = (
  answer: UnionToIntersection<AnswerPrompt<T>>,
  close: () => void
) => MessageMutualPayload;

export type AnswerPrompt<T extends Record<string, unknown>> = {
  [K in keyof T]: AnswerFunc<T, K>;
}[keyof T];

export type AnswerFunc<T extends Record<string, unknown>, K extends keyof T> = (
  key: K,
  value: T[K]
) => void;

const completeConfig = <T extends Record<string, unknown>>(
  config: InquireConfig<T>
): Required<InquireConfig<T>> => {
  return {
    screen: config.screen,
    adaptor: config.adaptor,
    defaultResult: config.defaultResult ?? {},
    time: Math.min(config.time ?? 14.5 * 60 * 1000, 15 * 60 * 1000),
    idle: config.idle ?? 2 ** 31 - 1, // 32bitの最大値
    log: config.log ?? defaultLogger,
  };
};

export const inquire = <T extends Record<string, unknown>>(
  prompt: Prompt<T>,
  partialConfig: InquireConfig<T>
): InquireResult<T> => {
  const { screen, adaptor, defaultResult, time, idle, log } =
    completeConfig(partialConfig);
  const result: Partial<T> = defaultResult;
  const answerEvent = createEventFlow<
    {
      [K in keyof T]: {
        key: K;
        value: T[K];
        all: Partial<T>;
      };
    }[keyof T]
  >();

  const answer: AnswerPrompt<T> = (key, value) => {
    const prev = result[key];
    // 値が変わっていない場合は何もしない
    if (isMatchHash(prev, value)) return;

    log("debug", "answer");
    log("debug", { key, value, prev });
    result[key] = value;
    answerEvent.emit({
      key,
      value,
      all: result,
    });
  };

  const renderPrompt = (): {
    renderIndex: number;
    renderResult: MessageMutualPayload;
  } => {
    //render中にdispatchが発生した場合は、再度renderを行う
    const renderIndex = hookContext.startRender();
    log("debug", `render #${renderIndex} start`);
    const ctx = getHookContext();

    log("debug", `render #${renderIndex} dispatch override`);

    let promptResult: MessageMutualPayload;
    const dispatched = deferDispatch(ctx, () => {
      promptResult = prompt(
        answer as UnionToIntersection<AnswerPrompt<T>>,
        close
      );
    });

    log("debug", `render #${renderIndex} dispatch override end`);

    hookContext.endRender();
    log("debug", `render #${renderIndex} end`);

    if (dispatched) {
      log("debug", `render #${renderIndex} rerender`);
      return renderPrompt();
    } else {
      log("debug", `render #${renderIndex} complete`);
      return {
        renderIndex,
        renderResult: promptResult!,
      };
    }
  };

  const open = async () => {
    log("debug", "inquirer open");

    const { renderIndex, renderResult } = renderPrompt();

    log("debug", {
      renderResult: renderResult,
    });

    const commitResult = await screen.commit(renderResult);
    if (commitResult.updated) {
      hookContext.mount(renderIndex, commitResult.messageId);
      log("debug", `payload mounted messageId: ${commitResult.messageId}`);
      resetIdleTimer();
    } else {
      log("error", "failed to initial commit");
      await close();
    }
  };

  const update = async () => {
    log("debug", "inquirer update");

    const { renderIndex, renderResult } = renderPrompt();

    log("debug", {
      renderResult: renderResult,
    });

    const commitResult = await screen.commit(renderResult);
    if (commitResult.messageId !== null) {
      hookContext.update(
        renderIndex,
        commitResult.messageId,
        commitResult.updated
      );
    } else {
      log("warn", "messageId is null");
    }

    if (commitResult.updated) {
      log("debug", `payload updated messageId: ${commitResult.messageId}`);
      resetIdleTimer();
    }
  };

  const close = async () => {
    log("debug", "inquirer close");
    answerEvent.offAll();

    const { renderIndex, renderResult } = renderPrompt();

    log("debug", {
      renderResult: renderResult,
    });

    await screen.commit(renderResult);
    await screen.close();

    hookContext.unmount(renderIndex);
    log("debug", "payload unmounted");

    disposeTimers();
  };

  const hookContext = createHookCycle(adaptor, update);
  const { resetIdleTimer, disposeTimers } = createInquireTimer(
    {
      time,
      idle,
      log,
    },
    close
  );

  //初回送信
  setImmediate(open);

  return {
    resultEvent: answerEvent,
    result: () => result,
    close,
  };
};

const createInquireTimer = (
  {
    time,
    idle,
    log,
  }: Pick<Required<InquireConfig<never>>, "idle" | "time" | "log">,
  close: () => void
) => {
  const timeoutTimer = createTimer(time);
  timeoutTimer.start(() => {
    log("debug", "inquirer timeout");
    close();
  });

  const idleTimer = createTimer(idle);
  idleTimer.start(() => {
    log("debug", "inquirer idle timeout");
    close();
  });

  const resetIdleTimer = () => {
    idleTimer.reset();
  };

  const disposeTimers = () => {
    timeoutTimer.dispose();
    idleTimer.dispose();
  };

  return {
    disposeTimers,
    resetIdleTimer,
  };
};
