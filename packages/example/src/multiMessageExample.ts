import { createScreen, inquire } from "discord-inquirer";
import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client } from "discord.js";
import { config } from "dotenv";

import { multiMessageSubCommandData } from "./commandData";
import { mainPrompt, subPrompt } from "./propmt/multiMessagePrompt";
import { logger } from "./util/logger";

import type { MainPromptAnswer } from "./propmt/multiMessagePrompt";
import type { Snowflake } from "discord.js";

config();

const client = new Client({
  intents: [],
});

const adaptor = createDiscordJsAdaptor(client);

client.on("ready", async (readyClient) => {
  readyClient.on("interactionCreate", async (interaction) => {
    logger.log(
      "debug",
      `interaction received type:${interaction.type} id:${interaction.id} token:${interaction.token}`
    );
    logger.log("trace", interaction);
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
        logger,
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
        logger,
      }
    );

    const mainResult = inquire<MainPromptAnswer>(mainPrompt, {
      screen: mainScreen,
      adaptor,
      logger,
    });

    const subResult = inquire<{
      count: number;
      userId: Snowflake;
    }>(subPrompt(mainResult.resultEvent), {
      screen: subScreen,
      logger: logger,
      adaptor,
    });

    // Close subPrompt when mainPrompt is closed
    mainResult.resultEvent
      .filter(({ key }) => key === "close")
      .on(() => {
        subResult.close();
      });

    subResult.resultEvent.on(({ key, value, all }) => {
      logger.log("debug", {
        key,
        value,
        all,
      });
    });
  });
});

await client.login(process.env.DISCORD_TOKEN!);
