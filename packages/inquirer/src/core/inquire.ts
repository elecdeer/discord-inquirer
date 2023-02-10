import { createEventFlow } from "@elecdeer/event-flow";

import { createRenderer } from "./renderer";
import { isMatchHash } from "../util/hash";
import { defaultLogger } from "../util/logger";
import { createTimer } from "../util/timer";

import type { Screen } from "./screen";
import type { DiscordAdaptor, MessageMutualPayload } from "../adaptor";
import type { Logger } from "../util/logger";
import type { IEventFlowHandler } from "@elecdeer/event-flow";
import type { UnionToIntersection } from "type-fest";

export type InquireResultEvent<T extends Record<string, unknown>> =
  IEventFlowHandler<
    {
      [K in keyof T]: {
        key: K;
        value: T[K];
        all: Partial<T>;
      };
    }[keyof T]
  >;

export type InquireResult<T extends Record<string, unknown>> = {
  resultEvent: InquireResultEvent<T>;

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

  let lastSendMessageId: string | undefined;

  const renderer = createRenderer(
    () => {
      return prompt(answer as UnionToIntersection<AnswerPrompt<T>>, () => {
        //noop
      });
    },
    async (value) => {
      const { messageId, updated } = await screen.commit(value);
      lastSendMessageId = messageId ?? lastSendMessageId;
      if (lastSendMessageId === undefined) {
        throw new Error("lastSendMessageId is undefined");
      }
      return lastSendMessageId;
    },
    adaptor,
    log
  );

  const { resetIdleTimer, disposeTimers } = createInquireTimer(
    {
      time,
      idle,
      log,
    },
    () => {
      // とりあえずnoop
    }
  );

  //初回送信
  renderer.mount();

  return {
    resultEvent: answerEvent,
    result: () => result,
    close: async () => {
      // とりあえずnoop
    },
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
  const timeoutTimer = createTimer(time).onTimeout(() => {
    log("debug", "inquirer timeout");
    close();
  });

  const idleTimer = createTimer(idle).onTimeout(() => {
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
