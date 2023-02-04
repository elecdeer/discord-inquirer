type Awaitable<T> = T | PromiseLike<T>;

export interface Timer {
  /**
   * handlerを渡しタイマーを開始する
   * @param handler
   */
  start: (handler: () => Awaitable<void>) => void;

  /**
   * まだhandlerが呼ばれていない場合、タイマーをリセットする
   */
  reset: () => void;

  /**
   * タイマーを停止する
   */
  dispose: () => void;

  /**
   * タイマーが停止あるいは終了したかどうか
   */
  finished: () => boolean;
}

export const createTimer = (timeMs: number): Timer => {
  let status: {
    timer: NodeJS.Timeout;
    handler: () => Awaitable<void>;
  } | null;

  const start = (handler: () => Awaitable<void>) => {
    const timer = setTimeout(() => {
      void handler();
      status = null;
    }, timeMs);

    status = {
      timer: timer,
      handler: handler,
    };
  };

  return {
    start: start,
    reset: () => {
      if (status !== null) {
        clearTimeout(status.timer);
        start(status.handler);
      }
    },
    dispose: () => {
      if (status !== null) {
        clearTimeout(status.timer);
        status = null;
      }
    },
    finished: () => status === null,
  };
};

export const createTimer2 = (timeoutMs: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let timeout = false;
  const handlers: (() => void)[] = [];

  const start = () => {
    timeoutId = setTimeout(() => {
      handlers.forEach((handler) => handler());
      timeout = true;
      timeoutId = null;
    }, timeoutMs);
  };

  const reset = () => {
    if (timeoutId === null) return;
    clearTimeout(timeoutId);
    start();
  };

  const dispose = () => {
    if (timeoutId === null) return;
    clearTimeout(timeoutId);
    timeoutId = null;
  };

  const isTimeout = () => timeout;

  const addHandler = (handler: () => void) => {
    handlers.push(handler);
  };

  const wait = async () => {
    if (timeout) return;
    await new Promise<void>((resolve) => {
      addHandler(resolve);
    });
  };

  start();

  return {
    reset,
    dispose,
    isTimeout,
    onTimeout: addHandler,
    wait,
  };
};
