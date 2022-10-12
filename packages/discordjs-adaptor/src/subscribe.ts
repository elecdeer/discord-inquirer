import type { DiscordAdaptor } from "discord-inquirer";
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
