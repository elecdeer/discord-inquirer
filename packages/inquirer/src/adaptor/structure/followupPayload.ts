import type { SetNullable } from "../../util/types";
import type { MessagePayload } from "./messagePayload";

export interface FollowupPayload extends MessagePayload {
  ephemeral?: boolean;
}

export type FollowupPayloadPatch = Omit<
  SetNullable<
    FollowupPayload,
    Exclude<keyof MessagePayload, "suppressEmbeds" | "ephemeral">
  >,
  "messageReference" | "stickerIds"
>;
