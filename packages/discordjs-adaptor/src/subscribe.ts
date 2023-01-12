import { transformers } from "discord-inquirer";
import { GatewayDispatchEvents } from "discord.js";

import type { DiscordAdaptor } from "discord-inquirer";
import type { Client, APIInteraction } from "discord.js";

export const subscribeInteraction =
  (client: Client<true>): DiscordAdaptor["subscribeInteraction"] =>
  (handler) => {
    const listener = (data: APIInteraction, shardId: number) => {
      const adaptorInteraction = transformers.interaction(data);
      handler(adaptorInteraction);
    };

    client.ws.on(GatewayDispatchEvents.InteractionCreate, listener);

    return () => {
      client.ws.off(GatewayDispatchEvents.InteractionCreate, listener);
    };
  };
