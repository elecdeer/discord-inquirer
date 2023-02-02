import { isAdaptorApplicationCommandInteraction } from "discord-inquirer";
import { createNodeAdaptor } from "discord-inquirer-adaptor-node";
import { config } from "dotenv";

import { commandData } from "./commandData";
import { openPrompt } from "./util/openPrompt";

config();

//TODO コマンド登録のUtilityがあってもいいかも

const adaptor = createNodeAdaptor({
  port: 8080,
  applicationId: process.env.APPLICATION_ID!,
  clientPublicKey: process.env.CLIENT_PUBLIC_KEY!,
  botToken: process.env.DISCORD_TOKEN!,
});

adaptor.subscribeInteraction(async (interaction) => {
  if (!isAdaptorApplicationCommandInteraction(interaction)) return;
  console.log("interactionReceived", interaction.data);

  if (interaction.data.name !== commandData.name) return;
  const option = interaction.data.options[0];
  if (option.type !== "subCommand") return;

  await openPrompt(adaptor)(interaction, option.name);
});
