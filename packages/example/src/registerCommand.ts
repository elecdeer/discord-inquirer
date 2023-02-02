import { config } from "dotenv";

import { commandData } from "./commandData";

//本来fetchの型定義は@types/nodeで定義されるべきだが、unstableだったためか入っていないため、undiciの型定義を利用する
import type { fetch as _fetch } from "undici";
declare const fetch: typeof _fetch;

config();

const registerCommand = async (applicationId: string, botToken: string) => {
  const body = JSON.stringify(commandData);
  console.log(body);

  await fetch(
    `https://discord.com/api/v10/applications/${applicationId}/commands`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${botToken}`,
      },
      body: body,
    }
  )
    .then((res) => res.json())
    .then((res) => {
      console.log("command registered");
      console.log(res);
    });
};

await registerCommand(process.env.APPLICATION_ID!, process.env.DISCORD_TOKEN!);
