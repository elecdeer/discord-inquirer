import {
  transformActionRowComponent,
  transformAllowedMentions,
  transformEmbed,
  transformFlags,
} from "discord-inquirer";

import type {
  AdaptorMessagePayload,
  AdaptorMessagePayloadPatch,
  DiscordAdaptor,
  Snowflake,
} from "discord-inquirer";
import type {
  ChannelManager,
  Client,
  MessageCreateOptions,
  MessageEditOptions,
  TextBasedChannel,
} from "discord.js";

export const sendMessage =
  (client: Client): DiscordAdaptor["sendMessage"] =>
  async (channelId, payload) => {
    const channel = await fetchTextChannel(client.channels, channelId);
    const message = await channel.send(createMessageOption(payload));

    return message.id;
  };

export const editMessage =
  (client: Client): DiscordAdaptor["editMessage"] =>
  async (channelId, messageId, payload) => {
    const channel = await fetchTextChannel(client.channels, channelId);
    const res = await channel.messages.edit(
      messageId,
      createMessageEditOption(payload)
    );
    return res.id;
  };

export const deleteMessage =
  (client: Client): DiscordAdaptor["deleteMessage"] =>
  async (channelId, messageId) => {
    const channel = await fetchTextChannel(client.channels, channelId);
    await channel.messages.delete(messageId);
  };

const fetchTextChannel = (
  channels: ChannelManager,
  channelId: Snowflake
): TextBasedChannel => {
  const channel = channels.cache.get(channelId);
  if (!channel) throw new Error("Channel not found");
  if (!channel.isTextBased()) {
    throw new Error("Channel is not text based");
  }
  return channel;
};

export const createMessageOption = (
  payload: AdaptorMessagePayload & {
    files?: MessageCreateOptions["files"];
  }
): MessageCreateOptions => {
  return {
    content: payload.content,
    embeds: payload.embeds?.map(transformEmbed),
    allowedMentions:
      payload.allowedMentions &&
      transformAllowedMentions(payload.allowedMentions),
    files: payload.files,
    components: payload.components?.map(transformActionRowComponent),
    stickers: payload.stickerIds,
    reply: payload.messageReference && {
      messageReference: payload.messageReference.messageId,
    },
    flags: transformFlags(payload),
  };
};

export const createMessageEditOption = (
  payload: AdaptorMessagePayloadPatch & {
    files?: MessageCreateOptions["files"];
  }
): MessageEditOptions => {
  return {
    content: payload.content,
    embeds: payload.embeds?.map(transformEmbed),
    allowedMentions:
      payload.allowedMentions === null
        ? {}
        : payload.allowedMentions &&
          transformAllowedMentions(payload.allowedMentions),
    files: payload.files,
    components: payload.components?.map(transformActionRowComponent),
    flags: transformFlags(payload),
  };
};
