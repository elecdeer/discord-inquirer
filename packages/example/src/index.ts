import {
  createScreen,
  inquire,
  renderRowComponent,
  useEffect,
  useSelectComponent,
  useCountButtonComponent,
} from "discord-inquirer";
import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";

import type { Prompt } from "discord-inquirer/src/core/inquire";

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
      selected: number[];
    }> = (answer, close) => {
      const [result, renderSelect] = useSelectComponent({
        options: [
          {
            label: "1",
            payload: 1,
          },
          {
            label: "2",
            payload: 2,
          },
          {
            label: "3",
            payload: 3,
          },
        ],
        maxValues: 2,
        minValues: 1,
      });

      const [count, renderButton] = useCountButtonComponent();

      useEffect(() => {
        if (count <= 0) return;

        const selected = result
          .filter((item) => item.selected)
          .map((item) => item.payload);

        answer("selected", selected);

        close();
      }, [count]);

      return {
        content: "Select 1 or 2 numbers",
        components: [
          renderRowComponent(renderSelect({})),
          renderRowComponent(
            renderButton({ style: "success", label: "button" })
          ),
        ],
      };
    };

    const result = inquire(prompt, {
      screen,
      adaptor,
      defaultResult: {
        selected: [] as number[],
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
