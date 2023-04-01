import { createEventFlow } from "@discord-inquirer/event-flow";

import { createRenderer } from "./renderer";
import { isMatchHash } from "../util/hash";
import { defaultLogger } from "../util/logger";
import { createTimer } from "../util/timer";

import type { Screen } from "./screen";
import type { DiscordAdaptor, MessageMutualPayload } from "../adaptor";
import type { Logger } from "../util/logger";
import type { IEventFlowHandler } from "@discord-inquirer/event-flow";
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

/**
 * Inquireの回答
 * @param resultEvent Promptでanswerが呼ばれ回答状態が変化したときにEmitされるEventFlow
 * @param result 現在の回答状態を取得する
 * @param close Inquireを終了する
 */
export type InquireResult<T extends Record<string, unknown>> = {
  resultEvent: InquireResultEvent<T>;

  result: () => Partial<T>;

  close: () => Promise<void>;
};

export type Inquire<T extends Record<string, unknown>> = (
  prompt: Prompt<T>,
  config: InquireConfig<T>
) => InquireResult<T>;

/**
 * Inquireの設定
 * @param screen Screen
 * @param adaptor DiscordAdaptor
 * @param defaultResult デフォルトのresult値
 * @param time 最初にinquirerを送信してからタイムアウトするまでの時間（ミリ秒）tokenの有効期限が15分なので最大でもそれより短くする必要がある デフォルトは14.5 * 60 * 1000 ms
 * @param idle 最後に回答状態かコンポーネントの状態が変化してからタイムアウトするまでの時間（ミリ秒） デフォルトは2 ** 31 - 1 ms
 */
export interface InquireConfig<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  screen: Screen;
  adaptor: DiscordAdaptor;

  defaultResult?: Partial<T>;

  time?: number;

  idle?: number;

  logger?: Logger;
}

export type Prompt<
  T extends Record<string, unknown> = Record<string, unknown>
> = (
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
    logger: config.logger ?? defaultLogger,
  };
};

/**
 * Promptを表示する
 * @param prompt
 * @param partialConfig
 */
export const inquire = <T extends Record<string, unknown>>(
  prompt: Prompt<T>,
  partialConfig: InquireConfig<T>
): InquireResult<T> => {
  const { screen, adaptor, defaultResult, time, idle, logger } =
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

    logger.log("debug", "answer");
    logger.log("debug", { key, value, prev });
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
        void close();
      });
    },
    async (value) => {
      resetIdleTimer();
      const { messageId } = await screen.commit(value);
      lastSendMessageId = messageId ?? lastSendMessageId;
      if (lastSendMessageId === undefined) {
        throw new Error("lastSendMessageId is undefined");
      }
      return lastSendMessageId;
    },
    adaptor,
    logger
  );

  const close = async () => {
    disposeTimers();
    await renderer.act(() => {
      renderer.unmount();
    });

    await screen.close();
  };

  const { resetIdleTimer, disposeTimers } = createInquireTimer(
    {
      time,
      idle,
      logger,
    },
    () => {
      void close();
    }
  );

  //初回送信
  renderer.mount();

  return {
    resultEvent: answerEvent,
    result: () => result,
    close: close,
  };
};

const createInquireTimer = (
  {
    time,
    idle,
    logger,
  }: Pick<Required<InquireConfig<never>>, "idle" | "time" | "logger">,
  close: () => void
) => {
  const timeoutTimer = createTimer(time).onTimeout(() => {
    logger.log("debug", "inquirer timeout");
    close();
  });

  const idleTimer = createTimer(idle).onTimeout(() => {
    logger.log("debug", "inquirer idle timeout");
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
