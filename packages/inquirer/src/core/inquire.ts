import { createEventFlow } from "@elecdeer/event-flow";
import nodeObjectHash from "node-object-hash";

import { immediateThrottle } from "../util/immediateThrottle";
import { createTimer } from "../util/timer";
import { createHookContext } from "./hookContext";

import type { DiscordAdaptor, MessageMutualPayload } from "../adaptor";
import type { Timer } from "../util/timer";
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
  const { screen, adaptor, defaultResult, time, idle } = config;

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
    const prev = result[key];
    // 値が変わっていない場合は何もしない
    if (checkAnswerValueEquality(prev, value)) return;

    result[key] = value;
    event.emit({
      key,
      value,
      all: result,
    });
  };

  const close = immediateThrottle(async () => {
    hookContext.startRender();
    event.offAll();
    hookContext.close();

    //close時はmountしない
    const promptResult = prompt(answer, close);
    await screen.render(promptResult);
    await screen.close();
    hookContext.endRender();

    dispose();
  });

  const update = immediateThrottle(async () => {
    hookContext.startRender();

    hookContext.beforeUnmount();
    const promptResult = prompt(answer, close);
    const { messageId } = await screen.render(promptResult);
    hookContext.afterMount(messageId);

    hookContext.endRender();

    resetIdleTimer();
  });

  const hookContext = createHookContext(adaptor, update);

  //初回送信
  update();

  const { resetIdleTimer, dispose } = createInquireTimer({ time, idle }, close);

  return {
    resultEvent: event,
    result: () => result,
  };
};

const hasher = nodeObjectHash({
  sort: {
    object: true,
    map: true,
    array: false,
    set: false,
  },
  coerce: false,
});

const checkAnswerValueEquality = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  return hasher.hash(a) === hasher.hash(b);
};

const createInquireTimer = (
  config: Pick<InquireConfig<never>, "idle" | "time">,
  close: () => void
) => {
  let timeoutTimer: Timer | null = null;
  if (config.time !== undefined) {
    timeoutTimer = createTimer(config.time);
    timeoutTimer.start(() => {
      close();
    });
  }

  let idleTimer: Timer | null = null;
  if (config.idle !== undefined) {
    idleTimer = createTimer(config.idle);
    idleTimer.start(() => {
      close();
    });
  }

  const resetIdleTimer = () => {
    if (idleTimer !== null) {
      idleTimer.reset();
    }
  };

  const dispose = () => {
    if (timeoutTimer !== null) {
      timeoutTimer.dispose();
    }
    if (idleTimer !== null) {
      idleTimer.dispose();
    }
  };

  return {
    dispose,
    resetIdleTimer,
  };
};
