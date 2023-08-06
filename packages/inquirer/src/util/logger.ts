// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type LogType = "trace" | "debug" | "warn" | "error" | string;

export type Logger = {
  log: (type: LogType, message: unknown) => void;
  pushContext: (context: string) => void;
  popContext: () => void;
};

export const createLogger = (
  printLog: (param: {
    type: LogType;
    context: string;
    contextDepth: number;
    message: unknown;
  }) => void,
): Logger => {
  const contextStack: string[] = [];

  return {
    log: (type, message) => {
      printLog({
        type,
        context: contextStack.at(-1) ?? "",
        contextDepth: contextStack.length,
        message,
      });
    },
    pushContext: (context) => {
      contextStack.push(context);
    },
    popContext: () => {
      contextStack.pop();
    },
  };
};

export const defaultLogger: Logger = createLogger(
  ({ type, message, context, contextDepth }) => {
    const args = contextDepth > 0 ? [`[${context}]`, message] : [message];

    switch (type) {
      case "trace":
        // noop
        // console.log(...args);
        return;
      case "debug":
        console.log(...args);
        return;
      case "warn":
        console.warn(...args);
        return;
      case "error":
        console.error(...args);
        return;

      default:
        throw new Error("unknown type");
    }
  },
);
