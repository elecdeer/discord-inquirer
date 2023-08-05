import { transformers } from "discord-inquirer";

import type { ApiFetcher } from "./fetcher";
import type { APIMessage } from "discord-api-types/v10";
import type {
  AdaptorMessagePayload,
  AdaptorMessagePayloadPatch,
} from "discord-inquirer";

export const sendFollowUp = (fetcher: ApiFetcher, applicationId: string) => {
  return async (token: string, payload: AdaptorMessagePayload) => {
    const body = transformers.adaptorMessagePayload(payload);
    const res = await fetcher<APIMessage>(
      "POST",
      `/webhooks/${applicationId}/${token}`,
      body,
    );
    return res.id;
  };
};

export const editFollowup = (fetcher: ApiFetcher, applicationId: string) => {
  return async (
    messageId: string,
    token: string,
    payload: AdaptorMessagePayloadPatch,
  ) => {
    const body = transformers.adaptorMessagePayloadPatch(payload);
    const res = await fetcher<APIMessage>(
      "PATCH",
      `/webhooks/${applicationId}/${token}/messages/${messageId}`,
      body,
    );
    return res.id;
  };
};

export const deleteFollowup = (fetcher: ApiFetcher, applicationId: string) => {
  return async (messageId: string, token: string) => {
    await fetcher(
      "DELETE",
      `/webhooks/${applicationId}/${token}/messages/${messageId}`,
    );
  };
};
