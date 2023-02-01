import util from "util";

export const log = (type: "debug" | "warn" | "error", message: unknown) => {
  const inspectMsg = util.inspect(message, {
    depth: 10,
    colors: true,
    breakLength: 200,
    compact: 5,
  });

  const time = new Date().toISOString();
  const prefix = `[${time}] [${type}]`;
  const inspectMsgWithPrefix = inspectMsg
    .split("\n")
    .map((line) => `${prefix} ${line}`)
    .join("\n");

  if (type === "debug") console.log(inspectMsgWithPrefix);
  if (type === "warn") console.warn(inspectMsgWithPrefix);
  if (type === "error") console.error(inspectMsgWithPrefix);
};
