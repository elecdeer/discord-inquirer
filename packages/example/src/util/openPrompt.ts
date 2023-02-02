import { createScreen, inquire } from "discord-inquirer";

import { log } from "./logger";
import { dispatchExamplePrompt } from "../propmt/dispatchTestPrompt";
import { modalPrompt } from "../propmt/modalPrompt";
import { pagedSelectPrompt } from "../propmt/pagedSelectPrompt";
import { selectsPrompt } from "../propmt/selectsPrompt";

import type { DiscordAdaptor } from "discord-inquirer";

export const openPrompt =
  (adaptor: DiscordAdaptor) =>
  async (interaction: { id: string; token: string }, promptType: string) => {
    // const adaptor = createDiscordJsAdaptor(readyClient);

    // const prompt = prompts[promptType];

    const screen = createScreen(
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

    const promptOption = {
      screen,
      adaptor,
      log,
    };

    let result;
    switch (promptType) {
      case "dispatch":
        result = inquire(dispatchExamplePrompt, promptOption);
        break;
      case "selects":
        result = inquire(selectsPrompt, promptOption);
        break;
      case "paged-select":
        result = inquire(pagedSelectPrompt, promptOption);
        break;
      case "modal":
        result = inquire(modalPrompt, promptOption);
        break;
      default:
        throw new Error("Invalid prompt type");
    }

    result.resultEvent.on(({ key, value, all }) => {
      console.log("key", key);
      console.log("value", value);
      console.log("all", all);
    });
  };
