import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client } from "discord.js";
import { config } from "dotenv";

import { logger } from "./util/logger";
import { openPrompt } from "./util/openPrompt";

config();

const client = new Client({
  intents: [],
});

const adaptor = createDiscordJsAdaptor(client);

client.on("ready", async (readyClient) => {
  logger.log("debug", "discord.js client ready");

  readyClient.on("interactionCreate", async (interaction) => {
    logger.log(
      "debug",
      `interaction received type:${interaction.type} id:${interaction.id} token:${interaction.token}`
    );
    logger.log("trace", interaction);
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "example") return;

    await openPrompt(adaptor)(
      interaction,
      interaction.options.getSubcommand(true)
    );
  });
});

await client.login(process.env.DISCORD_TOKEN!);
