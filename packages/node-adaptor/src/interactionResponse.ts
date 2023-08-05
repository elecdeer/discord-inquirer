import {
  InteractionResponseType,
  InteractionType,
} from "discord-api-types/v10";
import { transformers } from "discord-inquirer";

import { createInteractionServer } from "./server";

import type { ApiFetcher } from "./fetcher";
import type { InteractionServerOption } from "./server";
import type { APIInteractionResponse, APIMessage } from "discord-api-types/v10";
import type {
  AdaptorInteractionResponsePatch,
  DiscordAdaptor,
  Snowflake,
} from "discord-inquirer";
import type { APIInteraction } from "discord.js";

export const createInteractionAdaptor = (
  options: InteractionServerOption,
): Pick<DiscordAdaptor, "subscribeInteraction" | "sendInteractionResponse"> => {
  const interactionFlow = createInteractionServer(options);

  const responseStore = new Map<
    Snowflake,
    {
      interaction: APIInteraction;
      sendResponse: (
        interactionResponse: APIInteractionResponse,
      ) => Promise<void>;
    }
  >();

  interactionFlow.on(({ interaction, sendResponse }) => {
    responseStore.set(interaction.id, { interaction, sendResponse });
  });

  //PINGへの応答
  interactionFlow
    .filter(({ interaction }) => interaction.type === InteractionType.Ping)
    .on(async ({ sendResponse }) => {
      await sendResponse({ type: InteractionResponseType.Pong });
    });

  const adaptorInteractionFlow = interactionFlow.map(({ interaction }) =>
    transformers.interaction(interaction),
  );

  return {
    sendInteractionResponse: (interactionId, _, payload) => {
      const store = responseStore.get(interactionId);
      if (!store) {
        throw new Error("Interaction not received");
      }
      const interactionResponse =
        transformers.adaptorInteractionResponse(payload);

      return store.sendResponse(interactionResponse);
    },
    subscribeInteraction: (handleInteraction) => {
      const { off } = adaptorInteractionFlow.on(handleInteraction);
      return off;
    },
  };
};

export const getInteractionResponse =
  (fetcher: ApiFetcher, applicationId: string) => async (token: string) => {
    const res = await fetcher<APIMessage>(
      "GET",
      `/webhooks/${applicationId}/${token}/messages/@original`,
    );
    return res.id;
  };

export const editInteractionResponse =
  (fetcher: ApiFetcher, applicationId: string) =>
  async (token: string, payload: AdaptorInteractionResponsePatch) => {
    const body = transformers.adaptorMessagePayloadPatch(payload);
    const res = await fetcher<APIMessage>(
      "PATCH",
      `/webhooks/${applicationId}/${token}/messages/@original`,
      body,
    );
    return res.id;
  };

export const deleteInteractionResponse =
  (fetcher: ApiFetcher, applicationId: string) => async (token: string) => {
    await fetcher(
      "DELETE",
      `/webhooks/${applicationId}/${token}/messages/@original`,
    );
  };
