import { createEventFlow } from "@elecdeer/event-flow";
import { vi } from "vitest";

import type { DiscordAdaptor } from "../adaptor";
import type { AdaptorInteraction } from "../adaptor";

export const createDiscordAdaptorMock = (): DiscordAdaptor & {
  emitInteraction: (interaction: AdaptorInteraction) => void;
} => {
  const handlerFlow = createEventFlow<AdaptorInteraction>();

  return {
    sendMessage: vi.fn(),
    editMessage: vi.fn(),
    deleteMessage: vi.fn(),
    sendInteractionResponse: vi.fn(),
    getInteractionResponse: vi.fn(),
    editInteractionResponse: vi.fn(),
    deleteInteractionResponse: vi.fn(),
    sendFollowUp: vi.fn(),
    editFollowup: vi.fn(),
    deleteFollowup: vi.fn(),
    subscribeInteraction: vi.fn(
      (handleInteraction: (interaction: AdaptorInteraction) => void) => {
        const { off } = handlerFlow.on(handleInteraction);
        return () => {
          off();
        };
      }
    ),

    emitInteraction: (interaction) => {
      handlerFlow.emit(interaction);
    },
  };
};
