import { transformersAdaptorComponent } from "./transformAdaptorComponent";
import { transformersAdaptorEmbed } from "./transformAdaptorEmbed";
import { transformersAdaptorFollowupPayload } from "./transformAdaptorFollowupPayload";
import { transformersAdaptorInteractionResponse } from "./transformAdaptorInteractionResponse";
import { transformersAdaptorMessagePayload } from "./transformAdaptorMessagePayload";
import { transformersChannel } from "./transformChannel";
import { transformersInteraction } from "./transformInteraction";
import { transformersMember } from "./transformMember";
import { transformersRole } from "./transformPermission";
import { transformersUser } from "./transformUser";

export * from "./shared";

export const transformers = {
  ...transformersAdaptorComponent,
  ...transformersAdaptorEmbed,
  ...transformersAdaptorFollowupPayload,
  ...transformersAdaptorInteractionResponse,
  ...transformersAdaptorMessagePayload,
  ...transformersChannel,
  ...transformersInteraction,
  ...transformersMember,
  ...transformersRole,
  ...transformersUser,
};
