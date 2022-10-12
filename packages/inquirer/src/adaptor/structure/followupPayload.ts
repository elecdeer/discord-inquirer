import type { SetNullable } from "../../util/types";
import type { MessagePayload } from "./messagePayload";

export interface FollowupPayload extends Omit<MessagePayload, "stickerIds"> {
  ephemeral?: boolean;
}

export type FollowupPayloadPatch = Omit<
  SetNullable<
    FollowupPayload,
    Exclude<keyof FollowupPayload, "suppressEmbeds" | "ephemeral">
  >,
  "messageReference"
>;
