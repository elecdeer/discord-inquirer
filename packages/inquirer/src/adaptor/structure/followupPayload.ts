import type { AdaptorMessagePayload } from "./messagePayload";
import type { SetNullable } from "../../util/types";

export interface AdaptorFollowupPayload
  extends Omit<AdaptorMessagePayload, "stickerIds"> {
  ephemeral?: boolean;
}

export type AdaptorFollowupPayloadPatch = Omit<
  SetNullable<
    AdaptorFollowupPayload,
    Exclude<keyof AdaptorFollowupPayload, "suppressEmbeds" | "ephemeral">
  >,
  "messageReference"
>;
