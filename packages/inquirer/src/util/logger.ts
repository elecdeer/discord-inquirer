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
  }) => void
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
    const contextStr = contextDepth > 0 ? `[${context}]` : "";
    switch (type) {
      case "trace":
        // noop
        return;
      case "debug":
        console.log(contextStr, message);
        return;
      case "warn":
        console.warn(contextStr, message);
        return;
      case "error":
        console.error(contextStr, message);
        return;

      default:
        throw new Error("unknown type");
    }
  }
);
