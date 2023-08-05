import { transformers } from "discord-inquirer";

import type { ApiFetcher } from "./fetcher";
import type { APIMessage } from "discord-api-types/v10";
import type {
  AdaptorMessagePayload,
  AdaptorMessagePayloadPatch,
} from "discord-inquirer";

export const sendMessage =
  (fetcher: ApiFetcher) =>
  async (channelId: string, payload: AdaptorMessagePayload) => {
    const body = transformers.adaptorMessagePayload(payload);
    const res = await fetcher<APIMessage>(
      "POST",
      `/channels/${channelId}/messages`,
      body,
    );
    return res.id;
  };
export const editMessage =
  (fetcher: ApiFetcher) =>
  async (
    channelId: string,
    messageId: string,
    payload: AdaptorMessagePayloadPatch,
  ) => {
    const body = transformers.adaptorMessagePayloadPatch(payload);
    const res = await fetcher<APIMessage>(
      "PATCH",
      `/channels/${channelId}/messages/${messageId}`,
      body,
    );
    return res.id;
  };
export const deleteMessage =
  (fetcher: ApiFetcher) => async (channelId: string, messageId: string) => {
    await fetcher("DELETE", `/channels/${channelId}/messages/${messageId}`);
  };
