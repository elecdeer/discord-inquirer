import type { MessagePayload } from "../adaptor";

export type Prompt<T extends Record<string, unknown>> = (
  answer: {
    [K in keyof T]: (key: K, value: T[K]) => void;
  }[keyof T],
  close: () => void
) => Omit<MessagePayload, "messageReference">;
