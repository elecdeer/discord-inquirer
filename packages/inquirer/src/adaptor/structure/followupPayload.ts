import type { SetNullable } from "../../util/types";
import type { AdaptorMessagePayload } from "./messagePayload";

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
