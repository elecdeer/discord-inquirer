export type Logger = (
  type: "debug" | "warn" | "error",
  message: unknown
) => void;

export const defaultLogger: Logger = (type, message) => {
  switch (type) {
    case "debug":
      // noop
      return;
    case "warn":
      console.warn(message);
      return;
    case "error":
      console.error(message);
      return;

    default:
      throw new Error("unknown type");
  }
};
