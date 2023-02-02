import { createScreen, inquire } from "discord-inquirer";
import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client } from "discord.js";
import { config } from "dotenv";

import { multiMessageSubCommandData } from "./commandData";
import { mainPrompt, subPrompt } from "./propmt/multiMessagePrompt";
import { log } from "./util/logger";

import type { MainPromptAnswer } from "./propmt/multiMessagePrompt";
import type { Snowflake } from "discord.js";

config();

const client = new Client({
  intents: [],
});

const adaptor = createDiscordJsAdaptor(client);

client.on("ready", async (readyClient) => {
  readyClient.on("interactionCreate", async (interaction) => {
    console.log("interactionReceived", interaction);
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "example") return;
    if (
      interaction.options.getSubcommand(true) !==
      multiMessageSubCommandData["name"]
    )
      return;

    const mainScreen = createScreen(
      adaptor,
      {
        type: "interaction",
        interactionId: interaction.id,
        token: interaction.token,
      },
      {
        onClose: "deleteComponent",
        log,
      }
    );

    const subScreen = createScreen(
      adaptor,
      {
        type: "interactionFollowup",
        token: interaction.token,
      },
      {
        onClose: "deleteMessage",
        log,
      }
    );

    const mainResult = inquire<MainPromptAnswer>(mainPrompt, {
      screen: mainScreen,
      adaptor,
      log,
    });

    const subResult = inquire<{
      count: number;
      userId: Snowflake;
    }>(subPrompt(mainResult.resultEvent), {
      screen: subScreen,
      log,
      adaptor,
    });

    // Close subPrompt when mainPrompt is closed
    mainResult.resultEvent
      .filter(({ key }) => key === "close")
      .on(() => {
        subResult.close();
      });

    subResult.resultEvent.on(({ key, value, all }) => {
      console.log("key", key);
      console.log("value", value);
      console.log("all", all);
    });
  });
});

await client.login(process.env.DISCORD_TOKEN!);
