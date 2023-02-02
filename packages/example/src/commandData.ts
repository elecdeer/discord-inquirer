import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";

import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord-api-types/v10";

export const dispatchSubCommandData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "dispatch",
  description: "dispatch example",
} as const;

export const selectsSubCommandData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "selects",
  description: "selects example",
} as const;

export const pagedSelectSubCommandData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "paged-select",
  description: "pagedSelect example",
} as const;

export const modalSubCommandData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "modal",
  description: "modal example",
} as const;

export const multiMessageSubCommandData = {
  type: ApplicationCommandOptionType.Subcommand,
  name: "multi",
  description: "multi message example",
} as const;

export const commandData = {
  type: ApplicationCommandType.ChatInput,
  name: "example",
  description: "discord-inquire example command",
  options: [
    dispatchSubCommandData,
    selectsSubCommandData,
    pagedSelectSubCommandData,
    modalSubCommandData,
    multiMessageSubCommandData,
  ],
} satisfies RESTPostAPIChatInputApplicationCommandsJSONBody;
