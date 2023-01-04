import { transformAdaptorInteractionResponse } from "discord-inquirer";
import { Routes } from "discord.js";

import { createMessageEditOption } from "./message";

import type { DiscordAdaptor } from "discord-inquirer";
import type { Client } from "discord.js";

export const sendInteractionResponse =
  (client: Client<true>): DiscordAdaptor["sendInteractionResponse"] =>
  async (interactionId, token, payload) => {
    await client.rest.post(Routes.interactionCallback(interactionId, token), {
      body: transformAdaptorInteractionResponse(payload),
      auth: false,
    });
  };

export const getInteractionResponse =
  (client: Client<true>): DiscordAdaptor["getInteractionResponse"] =>
  async (token) => {
    const webhook = await client.fetchWebhook(client.application.id, token);
    const message = await webhook.fetchMessage("@original");
    return message.id;
  };

export const editInteractionResponse =
  (client: Client<true>): DiscordAdaptor["editInteractionResponse"] =>
  async (token, payload) => {
    const webhook = await client.fetchWebhook(client.application.id, token);
    const message = await webhook.editMessage(
      "@original",
      createMessageEditOption(payload)
    );
    return message.id;
  };

export const deleteInteractionResponse =
  (client: Client<true>): DiscordAdaptor["deleteInteractionResponse"] =>
  async (token) => {
    const webhook = await client.fetchWebhook(client.application.id, token);
    await webhook.deleteMessage("@original");
  };
