import type { MessageMutualPayload } from "../adaptor/messageFacade";

export type Prompt<T extends Record<string, unknown>> = (
  answer: {
    [K in keyof T]: (key: K, value: T[K]) => void;
  }[keyof T],
  close: () => void
) => MessageMutualPayload;
