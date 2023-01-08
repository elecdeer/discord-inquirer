import { createEventFlow } from "@elecdeer/event-flow";

import { isMatchHash } from "../util/hash";
import { immediateThrottle } from "../util/immediateThrottle";
import { createTimer } from "../util/timer";
import { createHookContext } from "./hookContext";

import type { DiscordAdaptor, MessageMutualPayload } from "../adaptor";
import type { Timer } from "../util/timer";
import type { Screen } from "./screen";
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
   * @default 14.5 * 60 * 1000
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
    if (isMatchHash(prev, value)) return;

    result[key] = value;
    event.emit({
      key,
      value,
      all: result,
    });
  };

  const open = async () => {
    hookContext.startRender();
    const promptResult = prompt(answer, close);
    hookContext.endRender();

    const { messageId } = await screen.commit(promptResult);

    hookContext.mount(messageId);

    resetIdleTimer();
  };

  const update = immediateThrottle(async () => {
    hookContext.startRender();
    const promptResult = prompt(answer, close);
    hookContext.endRender();

    const { messageId } = await screen.commit(promptResult);

    hookContext.update(messageId);

    resetIdleTimer();
  });

  const close = immediateThrottle(async () => {
    event.offAll();

    hookContext.startRender();
    const promptResult = prompt(answer, close);
    hookContext.endRender();

    await screen.commit(promptResult);
    await screen.close();

    hookContext.unmount();

    dispose();
  });

  const hookContext = createHookContext(adaptor, update);
  const { resetIdleTimer, dispose } = createInquireTimer(
    {
      time: Math.min(time ?? 14.5 * 60 * 1000, 15 * 60 * 1000),
      idle,
    },
    close
  );

  //初回送信
  setImmediate(open);

  return {
    resultEvent: event,
    result: () => result,
  };
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
