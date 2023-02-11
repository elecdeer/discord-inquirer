import { vi } from "vitest";

import type { DiscordAdaptor } from "../adaptor";
import type { AdaptorInteraction } from "../adaptor";

export type AdaptorMock = DiscordAdaptor & {
  emitInteraction: (interaction: AdaptorInteraction) => Promise<void>;
};

export const createDiscordAdaptorMock = (): AdaptorMock => {
  const interactionHandlers = new Set<
    (interaction: AdaptorInteraction) => Promise<void>
  >();

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
      (
        handleInteraction: (interaction: AdaptorInteraction) => Promise<void>
      ) => {
        interactionHandlers.add(handleInteraction);
        return () => {
          interactionHandlers.delete(handleInteraction);
        };
      }
    ),

    emitInteraction: async (interaction) => {
      for (const handler of interactionHandlers) {
        await handler(interaction);
      }
    },
  };
};
