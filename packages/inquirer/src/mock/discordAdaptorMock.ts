import { vi } from "vitest";

import type { DiscordAdaptor } from "../adaptor";
import type { Interaction } from "../adaptor";

export const createDiscordAdaptorMock = (): DiscordAdaptor & {
  emitInteraction: ((interaction: Interaction) => void) | undefined;
} => {
  let emitInteraction: ((interaction: Interaction) => void) | undefined =
    undefined;

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
      (handleInteraction: (interaction: Interaction) => void) => {
        emitInteraction = handleInteraction;
        return () => {
          //	noop
        };
      }
    ),

    emitInteraction: (interaction) => {
      emitInteraction?.(interaction);
    },
  };
};
