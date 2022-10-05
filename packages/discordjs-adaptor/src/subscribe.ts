import type { DiscordAdaptor } from "discord-inquirer";
import type {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import type { Client, Interaction } from "discord.js";

export const subscribeInteraction =
  (client: Client<true>): DiscordAdaptor["subscribeInteraction"] =>
  (handler) => {
    const listener = (interaction: Interaction) => {
      const base = {
        id: interaction.id,
        token: interaction.token,
        userId: interaction.user.id,
        channelId: interaction.channelId ?? undefined,
        guildId: interaction.guildId ?? undefined,
      };

      if (interaction.isMessageComponent()) {
        if (interaction.isButton()) {
          handler({
            ...base,
            type: "messageComponent",
            data: {
              componentType: "button",
              customId: interaction.customId,
            },
          });
        }

        if (interaction.isSelectMenu()) {
          handler({
            ...base,
            type: "messageComponent",
            data: {
              componentType: "selectMenu",
              customId: interaction.customId,
              values: interaction.values,
            },
          });
        }
      }

      if (interaction.isModalSubmit()) {
        const fields = interaction.fields.fields.reduce(
          (acc, com, customId) => {
            acc[customId] = com.value;
            return acc;
          },
          {} as Record<string, string>
        );

        handler({
          ...base,
          type: "modalSubmit",
          data: {
            customId: interaction.customId,
            fields: fields,
          },
        });
      }
    };

    client.on("interactionCreate", listener);

    return () => {
      client.off("interactionCreate", listener);
    };
  };

export const subscribeMessageReaction =
  (client: Client<true>): DiscordAdaptor["subscribeMessageReaction"] =>
  (handler) => {
    const listener =
      (action: "add" | "remove") =>
      (
        reaction: MessageReaction | PartialMessageReaction,
        user: User | PartialUser
      ) => {
        handler({
          action: action,
          messageId: reaction.message.id,
          channelId: reaction.message.channelId,
          emoji: {
            id: reaction.emoji.id,
            name: reaction.emoji.name,
            animated: reaction.emoji.animated ?? false,
          },
          userId: user.id,
        });
      };

    const addReactionListener = listener("add");
    const removeReactionListener = listener("remove");

    client.on("messageReactionAdd", addReactionListener);
    client.on("messageReactionRemove", removeReactionListener);

    return () => {
      client.off("messageReactionAdd", addReactionListener);
      client.off("messageReactionRemove", removeReactionListener);
    };
  };
