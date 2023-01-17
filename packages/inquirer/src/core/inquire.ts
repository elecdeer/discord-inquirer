import { createEventFlow } from "@elecdeer/event-flow";

import { createHookContext } from "./hookContext";
import { isMatchHash } from "../util/hash";
import { immediateThrottle } from "../util/immediateThrottle";
import { defaultLogger } from "../util/logger";
import { createTimer } from "../util/timer";

import type { Screen } from "./screen";
import type { DiscordAdaptor, MessageMutualPayload } from "../adaptor";
import type { Logger } from "../util/logger";
import type { IEventFlowHandler } from "@elecdeer/event-flow";

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
  answer: AnswerPrompt<T>,
  close: () => void
) => MessageMutualPayload;

export type AnswerPrompt<T extends Record<string, unknown>> = {
  [K in keyof T]: (key: K, value: T[K]) => void;
}[keyof T];

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

  const open = async () => {
    log("debug", "inquirer open");

    hookContext.startRender();
    const promptResult = prompt(answer, close);
    hookContext.endRender();

    log("debug", {
      renderResult: promptResult,
    });

    const commitResult = await screen.commit(promptResult);
    if (commitResult.updated) {
      hookContext.mount(commitResult.messageId);
      log("debug", `payload mounted messageId: ${commitResult.messageId}`);
      resetIdleTimer();
    } else {
      log("error", "failed to initial commit");
      close();
    }
  };

  const update = immediateThrottle(async () => {
    log("debug", "inquirer update");

    hookContext.startRender();
    const promptResult = prompt(answer, close);
    hookContext.endRender();

    log("debug", {
      renderResult: promptResult,
    });

    const commitResult = await screen.commit(promptResult);
    if (commitResult.updated) {
      hookContext.update(commitResult.messageId);
      log("debug", `payload updated messageId: ${commitResult.messageId}`);
      resetIdleTimer();
    }
  });

  const close = immediateThrottle(async () => {
    log("debug", "inquirer close");
    answerEvent.offAll();

    hookContext.startRender();
    const promptResult = prompt(answer, close);
    hookContext.endRender();

    log("debug", {
      renderResult: promptResult,
    });

    await screen.commit(promptResult);
    await screen.close();

    hookContext.unmount();
    log("debug", "payload unmounted");

    disposeTimers();
  });

  const hookContext = createHookContext(adaptor, update);
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
