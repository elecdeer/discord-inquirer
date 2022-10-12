import {
  createScreen,
  inquire,
  useButtonEvent,
  useCustomId,
  useEffect,
  useReactionEvent,
  useState,
} from "discord-inquirer";
import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client, Partials, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";

import type { Prompt } from "discord-inquirer/src/core/inquire";

config();

const client = new Client({
  intents: ["Guilds", "GuildMessages", "GuildMessageReactions"],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

client.on("ready", async (readyClient) => {
  console.log("Client is ready");

  const command = new SlashCommandBuilder()
    .setName("example")
    .setDescription("This is an example command");
  await readyClient.application.commands.create(command);

  readyClient.on("interactionCreate", (interaction) => {
    if (!(interaction.isCommand() && interaction.commandName === "example")) {
      return;
    }

    const adaptor = createDiscordJsAdaptor(readyClient);
    const screen = createScreen(
      adaptor,
      {
        type: "interaction",
        interactionId: interaction.id,
        token: interaction.token,
      },
      {
        onClose: "deleteComponent",
      }
    );

    const prompt: Prompt<{
      count: number;
    }> = (answer, close) => {
      const [count, setCount] = useState(0);

      const customId = useCustomId("increment");

      useEffect(() => {
        answer("count", count);

        if (count >= 6) {
          close();
        }
      }, [count]);

      useButtonEvent(customId, (interaction, deferUpdate) => {
        deferUpdate();
        setCount((count) => count + 1);
      });

      useReactionEvent((reaction) => {
        console.log("reaction", reaction);
        if (reaction.action === "add") {
          setCount((count) => count + 1);
        } else {
          setCount((count) => count - 1);
        }
      });

      return {
        content: count >= 6 ? "closed" : `count: ${count}`,
        components: [
          {
            type: "row",
            components: [
              {
                type: "button",
                label: "increment",
                style: "primary",
                customId: customId,
              },
            ],
          },
        ],
      };
    };

    const result = inquire(prompt, {
      screen,
      adaptor,
      defaultResult: {
        count: -1,
      },
    });

    console.log(result.result());

    result.resultEvent.on(({ key, value, all }) => {
      console.log("key", key);
      console.log("value", value);
      console.log("all", all);
    });
  });
});

await client.login(process.env.DISCORD_TOKEN);
