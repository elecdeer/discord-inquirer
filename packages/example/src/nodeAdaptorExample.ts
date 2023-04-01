import { createNodeAdaptor } from "@discord-inquirer/adaptor-node";
import { isAdaptorApplicationCommandInteraction } from "discord-inquirer";
import { config } from "dotenv";

import { commandData } from "./commandData";
import { logger } from "./util/logger";
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
  logger.log(
    "debug",
    `interaction received type:${interaction.type} id:${interaction.id} token:${interaction.token}`
  );
  logger.log("trace", interaction);

  if (interaction.data.name !== commandData.name) return;
  const option = interaction.data.options[0];
  if (option.type !== "subCommand") return;

  await openPrompt(adaptor, interaction, option.name);
});
