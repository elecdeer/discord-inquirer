import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client } from "discord.js";
import { config } from "dotenv";

import { openPrompt } from "./util/openPrompt";

config();

const client = new Client({
  intents: [],
});

const adaptor = createDiscordJsAdaptor(client);

client.on("ready", async (readyClient) => {
  console.log("Client is ready");

  readyClient.on("interactionCreate", async (interaction) => {
    console.log("interactionReceived", interaction);
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "example") return;

    await openPrompt(adaptor)(
      interaction,
      interaction.options.getSubcommand(true)
    );
  });
});

await client.login(process.env.DISCORD_TOKEN!);
