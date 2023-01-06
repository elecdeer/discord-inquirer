import {
  createScreen,
  inquire,
  Row,
  useSelectComponent,
  useConfirmButtonComponent,
  ChannelSelect,
  UserSelect,
  RoleSelect,
} from "discord-inquirer";
import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";

import type { Prompt } from "discord-inquirer";

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
      const [result, Select] = useSelectComponent({
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
        onSelected: (selected) => {
          console.log("handleSelected", selected);
        },
      });

      const [{ ok: confirmed }, ConfirmButton] = useConfirmButtonComponent(
        () => {
          console.log(result);
          return {
            ok: result.filter(({ selected }) => selected).length > 1,
          };
        },
        () => {
          const selected = result
            .filter((item) => item.selected)
            .map((item) => item.payload);

          answer("selected", selected);

          close();
        }
      );

      // useEffect(() => {
      //   const clear = adaptor.subscribeInteraction((interaction) => {
      //     if (interaction.type !== "messageComponent") return;
      //     console.log("interaction", interaction);
      //   });
      //
      //   return () => {
      //     clear();
      //   };
      // });

      return {
        content: confirmed
          ? `selected: ${result
              .filter((item) => item.selected)
              .map((item) => item.payload)
              .join(",")}`
          : "Select 1 or 2 numbers",
        components: [
          Row(
            Select({
              maxValues: 2,
              minValues: 1,
            })()
          ),
          Row(
            ChannelSelect({
              customId: "channel-select",
            })()
          ),
          Row(
            UserSelect({
              customId: "user-select",
            })()
          ),
          Row(
            RoleSelect({
              customId: "role-select",
            })()
          ),
          Row(ConfirmButton({ style: "success", label: "confirm" })()),
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
