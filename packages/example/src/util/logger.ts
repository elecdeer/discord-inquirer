import { createLogger } from "discord-inquirer";
import util from "util";

export const logger = createLogger(
  ({ type, message, context, contextDepth }) => {
    const inspectMsg = util.inspect(message, {
      depth: 10,
      colors: true,
      breakLength: 200,
      compact: 5,
    });

    const time = new Date().toISOString();
    const prefix =
      `[${time}] [${type}]` + (contextDepth > 0 ? ` [${context}]` : "");
    const inspectMsgWithPrefix = inspectMsg
      .split("\n")
      .map((line) => `${prefix} ${line}`)
      .join("\n");

    if (type === "trace") console.log(inspectMsgWithPrefix);
    if (type === "debug") console.log(inspectMsgWithPrefix);
    if (type === "warn") console.warn(inspectMsgWithPrefix);
    if (type === "error") console.error(inspectMsgWithPrefix);
  }
);
