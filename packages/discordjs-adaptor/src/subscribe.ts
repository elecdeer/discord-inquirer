import { transformers } from "discord-inquirer";
import { GatewayDispatchEvents } from "discord.js";

import type { DiscordAdaptor } from "discord-inquirer";
import type { Client, APIInteraction } from "discord.js";

export const subscribeInteraction =
  (client: Client<true>): DiscordAdaptor["subscribeInteraction"] =>
  (handler) => {
    const listener = (data: APIInteraction, shardId: number) => {
      console.log("raw");
      console.log(JSON.stringify(data, null, 2));
      const adaptorInteraction = transformers.interaction(data);

      console.log("transformed");
      console.log(JSON.stringify(adaptorInteraction, null, 2));
      handler(adaptorInteraction);
    };

    client.ws.on(GatewayDispatchEvents.InteractionCreate, listener);

    return () => {
      client.ws.off(GatewayDispatchEvents.InteractionCreate, listener);
    };
  };
