import type {
  AdaptorPartialNonThreadChannel,
  AdaptorPartialThreadChannel,
} from "../adaptor";

export const createAdaptorPartialThreadChannelBaseMock = () => {
  return {
    id: "channelIdValue",
    name: "channelNameValue",
    threadMetadata: {
      archived: false,
      autoArchiveDuration: 60,
      archiveTimestamp: new Date("2021-01-02T00:00:00.000Z"),
      locked: false,
      invitable: false,
      createdTimestamp: new Date("2021-01-01T00:00:00.000Z"),
    },
    parentId: "parentIdValue",
  } satisfies Omit<AdaptorPartialThreadChannel, "type">;
};

export const createAdaptorPartialNonThreadChannelMock = () => {
  return {
    id: "channelIdValue",
    name: "channelNameValue",
  } satisfies Omit<AdaptorPartialNonThreadChannel, "type">;
};
