import { inquire, createScreen, useState, useEffect } from "discord-inquirer";
import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";

import type { Interaction } from "discord.js";

config();

const client = new Client({
  intents: [],
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

    const screen = createScreen(
      createDiscordJsAdaptor(readyClient),
      {
        type: "interaction",
        interactionId: interaction.id,
        token: interaction.token,
      },
      {
        onClose: "deleteComponent",
      }
    );

    const result = inquire(
      (answer, close) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
          answer("count", count);

          if (count >= 10) {
            close();
          }
        }, [count]);

        useEffect((messageId) => {
          const handle = (interaction: Interaction) => {
            if (!interaction.isButton()) return;
            if (
              interaction.message.id === messageId &&
              interaction.customId === "customId"
            ) {
              interaction.deferUpdate();
              console.log("Button clicked");

              //これ呼び出すとそのまま同期的にdispatchが呼ばれるが、途中のメッセージ編集とかがasyncなため、途中で処理がこっちに帰ってくる⁇
              setCount((c) => c + 1);
              setCount((c) => c + 1);

              //setImmediateとかでスロットルするしかないか？
            }
          };

          console.log("handle");
          readyClient.on("interactionCreate", handle);

          return () => {
            console.log("unhandle");
            readyClient.off("interactionCreate", handle);
          };
        });

        return {
          content: `count: ${count}`,
          components: [
            {
              type: "row",
              components: [
                {
                  type: "button",
                  label: "increment",
                  customId: "customId",
                  style: "primary",
                  url: undefined,
                },
              ],
            },
          ],
        };
      },
      {
        screen,
      }
    );

    result.resultEvent.on(({ key, value, all }) => {
      console.log("key", key);
      console.log("value", value);
      console.log("all", all);
    });
  });
});

await client.login(process.env.DISCORD_TOKEN);
