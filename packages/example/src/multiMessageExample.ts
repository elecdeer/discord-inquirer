import { createScreen, inquire } from "discord-inquirer";
import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client } from "discord.js";
import { config } from "dotenv";

import { multiMessageSubCommandData } from "./commandData";
import {
  mainPrompt,
  subPromptButton,
  subPromptSelect,
} from "./propmt/multiMessagePrompt";
import { log } from "./util/logger";

import type {
  MainPromptAnswer,
  MultiMessageSubType,
} from "./propmt/multiMessagePrompt";
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
        onClose: "keep",
        log,
      }
    );

    const { resultEvent } = inquire<MainPromptAnswer>(mainPrompt, {
      screen: mainScreen,
      adaptor,
      log,
    });

    let count = 0;
    let userId = "";
    let closeOldSubPrompt: (() => Promise<void>) | undefined;

    const openSubPrompt = async (value: MultiMessageSubType) => {
      if (value === "button") {
        const subResult = inquire<{
          count: number;
        }>(subPromptButton, {
          screen: subScreen,
          log,
          adaptor,
        });
        closeOldSubPrompt = subResult.close;
        subResult.resultEvent.on(({ value }) => {
          count = value;
        });
      }
      if (value === "select") {
        const subResult = inquire<{
          userId: Snowflake;
        }>(subPromptSelect, {
          screen: subScreen,
          log,
          adaptor,
        });
        closeOldSubPrompt = subResult.close;
        subResult.resultEvent.on(({ value }) => {
          userId = value;
        });
      }
    };

    resultEvent.on(async ({ value, all }) => {
      await openSubPrompt(value);
    });

    await openSubPrompt("button");
  });
});

await client.login(process.env.DISCORD_TOKEN!);
