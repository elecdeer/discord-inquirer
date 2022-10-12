import { createEventFlow } from "@elecdeer/event-flow";

import { immediateThrottle } from "../util/immediateThrottle";
import { createHookContext } from "./hookContext";

import type { MessageMutualPayload } from "../adaptor/messageFacade";
import type { Screen } from "./screen";
import type { IEventFlowHandler } from "@elecdeer/event-flow/src/types";

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
  /**
   * この値はprompt内に持ち込まれるべきでは無い
   */
  result: () => Partial<T>;
};

export type Inquire<T extends Record<string, unknown>> = (
  prompt: Prompt<T>,
  config: InquireConfig<T>
) => InquireResult<T>;

interface InquireConfig<T extends Record<string, unknown>> {
  screen: Screen;

  defaultResult?: Partial<T>;

  /**
   * 最初にinquirerを送信してからタイムアウトするまでの時間
   * tokenの有効期限が15分なので最大でもそれより短くする
   */
  time?: number;

  /**
   * 最後に回答状態かコンポーネントの状態が変化してからタイムアウトするまでの時間
   */
  idle?: number;
}

export type Prompt<T extends Record<string, unknown>> = (
  answer: AnswerPrompt<T>,
  close: () => void
) => MessageMutualPayload;

export type AnswerPrompt<T extends Record<string, unknown>> = {
  [K in keyof T]: (key: K, value: T[K]) => void;
}[keyof T];

export const inquire = <T extends Record<string, unknown>>(
  prompt: Prompt<T>,
  config: InquireConfig<T>
): InquireResult<T> => {
  const { screen, defaultResult, time, idle } = config;

  const result: Partial<T> = defaultResult ?? {};
  const event = createEventFlow<
    {
      [K in keyof T]: {
        key: K;
        value: T[K];
        all: Partial<T>;
      };
    }[keyof T]
  >();

  const answer: AnswerPrompt<T> = (key, value) => {
    result[key] = value;

    event.emit({
      key,
      value,
      all: result,
    });
  };

  const close = async () => {
    event.offAll();
    hookContext.close();
    await screen.close();
  };

  const update = async () => {
    hookContext.startRender();

    //毎回unmountしているけど、renderでチェックした方が良い
    hookContext.beforeUnmount();
    const promptResult = prompt(answer, close);
    const { messageId } = await screen.render(promptResult);
    hookContext.afterMount(messageId);

    hookContext.endRender();
  };

  const queueUpdate = immediateThrottle(() => {
    void update();
  });

  const hookContext = createHookContext(() => {
    queueUpdate();
  });

  setImmediate(async () => {
    await update();
  });

  return {
    resultEvent: event,
    result: () => result,
  };
};
