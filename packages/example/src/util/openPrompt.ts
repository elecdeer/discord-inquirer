import { createScreen, inquire } from "discord-inquirer";

import { logger } from "./logger";
import { dispatchExamplePrompt } from "../propmt/dispatchTestPrompt";
import { fetchWeatherPrompt } from "../propmt/fetchWeatherPrompt";
import { modalPrompt } from "../propmt/modalPrompt";
import { mainPrompt, subPrompt } from "../propmt/multiMessagePrompt";
import { pagedSelectPrompt } from "../propmt/pagedSelectPrompt";
import { selectsPrompt } from "../propmt/selectsPrompt";

import type { MainPromptAnswer } from "../propmt/multiMessagePrompt";
import type {
  DiscordAdaptor,
  InquireResultEvent,
  Prompt,
} from "discord-inquirer";

export const openPrompt = async (
  adaptor: DiscordAdaptor,
  interaction: { id: string; token: string },
  promptType: string,
) => {
  switch (promptType) {
    case "dispatch":
      await openMonoPagePrompt(interaction, adaptor, dispatchExamplePrompt);
      return;
    case "selects":
      await openMonoPagePrompt(interaction, adaptor, selectsPrompt);
      return;
    case "paged-select":
      await openMonoPagePrompt(interaction, adaptor, pagedSelectPrompt);
      return;
    case "modal":
      await openMonoPagePrompt(interaction, adaptor, modalPrompt);
      return;
    case "weather":
      await openMonoPagePrompt(interaction, adaptor, fetchWeatherPrompt);
      return;
    case "multi":
      await openMultiPrompt(interaction, adaptor, mainPrompt, subPrompt);
      return;
    default:
      throw new Error("Invalid prompt type");
  }
};

const openMonoPagePrompt = async (
  interaction: { id: string; token: string },
  adaptor: DiscordAdaptor,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prompt: Prompt<any>,
) => {
  const screen = createScreen(
    adaptor,
    {
      type: "interaction",
      interactionId: interaction.id,
      token: interaction.token,
    },
    {
      onClose: "deleteComponent",
      logger,
    },
  );

  const result = inquire(prompt, {
    screen,
    adaptor,
    logger,
  });

  result.resultEvent.on(({ key, value, all }) => {
    logger.log("debug", {
      key,
      value,
      all,
    });
  });
};

const openMultiPrompt = async (
  interaction: { id: string; token: string },
  adaptor: DiscordAdaptor,
  mainPrompt: Prompt<MainPromptAnswer>,
  subPrompt: (
    mainResultEvent: InquireResultEvent<MainPromptAnswer>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Prompt<any>,
) => {
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
    },
  );

  //同じinteractionに対して複数のscreenを表示する際は、2つめ以降のscreenはinteractionFollowupを指定する必要がある
  const subScreen = createScreen(
    adaptor,
    {
      type: "interactionFollowup",
      token: interaction.token,
    },
    {
      onClose: "deleteMessage",
      logger,
    },
  );

  const mainResult = inquire<MainPromptAnswer>(mainPrompt, {
    screen: mainScreen,
    adaptor,
    logger,
  });

  const subResult = inquire(subPrompt(mainResult.resultEvent), {
    screen: subScreen,
    logger: logger,
    adaptor,
  });

  //メインPromptが閉じられたらサブPromptも閉じる
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
};
