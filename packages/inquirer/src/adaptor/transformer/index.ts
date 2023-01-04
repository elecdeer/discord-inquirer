import type { z } from "zod";

export * from "./transformAdaptorComponent";
export * from "./transformAdaptorEmbed";
export * from "./transformAdaptorFollowupPayload";
export * from "./transformAdaptorInteractionResponse";
export * from "./transformAdaptorMessagePayload";

//from: https://github.com/colinhacks/zod/issues/372#issuecomment-826380330
export const schemaForType =
  <T>() =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <S extends z.ZodType<T, any, any>>(arg: S): S => {
    return arg;
  };
