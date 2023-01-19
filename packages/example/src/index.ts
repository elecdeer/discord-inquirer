import {
  createScreen,
  inquire,
  Row,
  useChannelSelectComponent,
  useConfirmButtonComponent,
  useRoleSelectComponent,
  useStringSelectComponent,
  useUserSelectComponent,
  useModalComponent,
  useButtonComponent,
  useSelectPaging,
  closeSplitter,
} from "discord-inquirer";
import { createDiscordJsAdaptor } from "discord-inquirer-adaptor-discordjs";
import { Client, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";
import * as util from "util";

import type { Prompt } from "discord-inquirer";

config();

const client = new Client({
  intents: [],
});

client.on("ready", async (readyClient) => {
  console.log("Client is ready");

  const command = new SlashCommandBuilder()
    .setName("example")
    .setDescription("This is an example command");
  await readyClient.application.commands.create(command);

  readyClient.on("interactionCreate", (interaction) => {
    if (!(interaction.isCommand() && interaction.commandName === "example")) {
      return;
    }

    const log = (type: "debug" | "warn" | "error", message: unknown) => {
      const inspectMsg = util.inspect(message, {
        depth: 10,
        colors: true,
        breakLength: 200,
        compact: 5,
      });

      if (type === "debug") console.log(inspectMsg);
      if (type === "warn") console.warn(inspectMsg);
      if (type === "error") console.error(inspectMsg);
    };

    const adaptor = createDiscordJsAdaptor(readyClient);
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

    // const result = inquire(prompt, {
    //   screen,
    //   adaptor,
    //   defaultResult: {
    //     selected: [] as number[],
    //   },
    //   log,
    // });

    const result = inquire(prompt3, {
      screen,
      adaptor,
      log,
    });

    result.resultEvent.on(({ key, value, all }) => {
      console.log("key", key);
      console.log("value", value);
      console.log("all", all);
    });
  });
});

const prompt: Prompt<{
  selected: number[];
}> = (answer, close) => {
  const [result, Select] = useStringSelectComponent({
    options: [
      {
        label: "1",
        payload: 1,
      },
      {
        label: "2",
        payload: 2,
      },
      {
        label: "3",
        payload: 3,
      },
    ],
    onSelected: (selected) => {
      console.log("handleSelected", selected);
    },
  });

  const [{ ok: confirmed }, ConfirmButton] = useConfirmButtonComponent(
    () => {
      console.log(result);
      return {
        ok: result.filter(({ selected }) => selected).length > 1,
      };
    },
    () => {
      const selected = result
        .filter((item) => item.selected)
        .map((item) => item.payload);

      answer("selected", selected);

      close();
    }
  );

  const [_, ChannelSelectComponent] = useChannelSelectComponent({
    channelTypes: ["guildText"],
    onSelected: (selected) => {
      console.log("channel selected", selected);
    },
  });

  const [__, UserSelectComponent] = useUserSelectComponent({
    onSelected: (selected) => {
      console.log("user selected", selected);
    },
  });

  const [___, RoleSelectComponent] = useRoleSelectComponent({
    onSelected: (selected) => {
      console.log("role selected", selected);
    },
  });

  return {
    content: confirmed
      ? `selected: ${result
          .filter((item) => item.selected)
          .map((item) => item.payload)
          .join(",")}`
      : "Select 1 or 2 numbers",
    components: [
      // Row(
      //   Select({
      //     maxValues: 2,
      //     minValues: 1,
      //   })()
      // ),
      Row(
        ChannelSelectComponent({
          maxValues: 2,
        })()
      ),
      Row(
        UserSelectComponent({
          maxValues: 2,
        })()
      ),
      Row(
        RoleSelectComponent({
          maxValues: 2,
        })()
      ),
      Row(ConfirmButton({ style: "success", label: "confirm" })()),
    ],
  };
};

const prompt2: Prompt<{
  value: string;
}> = (answer, close) => {
  const [result, Button] = useModalComponent({
    title: "The modal",
    components: [
      {
        key: "bar",
        label: "bar",
        style: "short",
      },
    ],
    onSubmit: (result) => {
      answer("value", result.bar);
    },
  });

  return {
    content:
      result === null
        ? `please click open modal button!`
        : `value: ${result.bar}`,
    components: [
      Row(
        Button({
          style: "success",
          label: "open modal",
        })()
      ),
    ],
  };
};

const allOptions = [...Array(30)].map((_, i) => ({
  label: `${i}`,
  payload: i,
}));
const prompt3 = ((answer, close) => {
  const { setPage, selectParams } = useSelectPaging({
    pageOptions: closeSplitter(allOptions),
    showSelectedAlways: true,
    maxValues: 3,
    minValues: 2,
  });
  const [result, Select] = useStringSelectComponent(selectParams);

  const PrevButton = useButtonComponent({
    onClick: () => {
      setPage((page) => page - 1);
    },
  });
  const NextButton = useButtonComponent({
    onClick: () => {
      setPage((page) => page + 1);
    },
  });

  return {
    content: `selected: ${result
      .filter((item) => item.selected)
      .map((item) => item.payload)
      .join(",")}`,
    components: [
      Row(Select()),
      Row(
        PrevButton({ style: "primary", label: "prev" })(),
        NextButton({ style: "primary", label: "next" })()
      ),
    ],
  };
}) satisfies Prompt<{
  value: number;
}>;

await client.login(process.env.DISCORD_TOKEN);
