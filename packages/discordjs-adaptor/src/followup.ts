import { createMessageEditOption, createMessageOption } from "./message";

import type { DiscordAdaptor } from "discord-inquirer";
import type { Client } from "discord.js";

export const sendFollowUp =
  (client: Client<true>): DiscordAdaptor["sendFollowUp"] =>
  async (token, payload) => {
    const webhook = await client.fetchWebhook(client.application.id, token);
    const message = await webhook.send(createMessageOption(payload));
    return message.id;
  };

export const editFollowUp =
  (client: Client<true>): DiscordAdaptor["editFollowup"] =>
  async (messageId, token, payload) => {
    const webhook = await client.fetchWebhook(client.application.id, token);
    const message = await webhook.editMessage(
      messageId,
      createMessageEditOption(payload)
    );
    return message.id;
  };

export const deleteFollowUp =
  (client: Client<true>): DiscordAdaptor["deleteFollowup"] =>
  async (messageId, token) => {
    const webhook = await client.fetchWebhook(client.application.id, token);
    await webhook.deleteMessage(messageId);
  };
