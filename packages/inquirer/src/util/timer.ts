export const createTimer = (timeoutMs: number) => {
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
    return timer;
  };

  const wait = async () => {
    if (timeout) return;
    await new Promise<void>((resolve) => {
      addHandler(resolve);
    });
  };

  start();

  const timer = {
    reset,
    dispose,
    isTimeout,
    onTimeout: addHandler,
    wait,
  };

  return timer;
};
