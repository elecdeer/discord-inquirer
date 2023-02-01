import { ChannelSelect } from "../../adaptor";
import { useChannelSelectEvent } from "../effect/useChannelSelectEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
  AdaptorPartialChannel,
  AdaptorChannelTypes,
  ChannelSelectComponentBuilder,
  AdaptorPartialNonThreadChannel,
  AdaptorPartialThreadChannel,
} from "../../adaptor";

export type ChannelSelectResultValue<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = TypeSpecifiedChannel<ChannelTypes>;

export type TypeSpecifiedChannel<T extends AdaptorChannelTypes> = {
  guildText: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildText";
  };
  dm: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "dm";
  };
  guildVoice: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildVoice";
  };
  groupDm: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "groupDm";
  };
  guildCategory: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildCategory";
  };
  guildAnnouncement: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildAnnouncement";
  };
  announcementThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "announcementThread";
  };
  publicThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "publicThread";
  };
  privateThread: Omit<AdaptorPartialThreadChannel, "type"> & {
    type: "privateThread";
  };
  guildStageVoice: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildStageVoice";
  };
  guildDirectory: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildDirectory";
  };
  guildForum: Omit<AdaptorPartialNonThreadChannel, "type"> & {
    type: "guildForum";
  };
}[T];

export type UseChannelSelectComponentResult<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = [
  selectResult: ChannelSelectResultValue<ChannelTypes>[],
  ChannelSelect: ChannelSelectComponentBuilder<{
    customId: string;
  }>
];

export type UseChannelSingleSelectComponentResult<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = [
  selectResult: ChannelSelectResultValue<ChannelTypes> | null,
  ChannelSelect: ChannelSelectComponentBuilder<{
    customId: string;
    maxValues: 1;
  }>
];

export const useChannelSelectComponent = <
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
>(
  params: {
    channelTypes?: ChannelTypes[];
    onSelected?: (selected: ChannelSelectResultValue<ChannelTypes>[]) => void;
  } = {}
): UseChannelSelectComponentResult<ChannelTypes> => {
  const customId = useCustomId("channelSelect");

  const [selected, setSelected] = useState<
    ChannelSelectResultValue<ChannelTypes>[]
  >([]);

  const markChanged = useObserveValue(selected, params.onSelected);

  useChannelSelectEvent(customId, async (_, channels, deferUpdate) => {
    await deferUpdate();

    const filteredChannels = channels.filter(
      (channel): channel is ChannelSelectResultValue<ChannelTypes> => {
        if (params.channelTypes === undefined) return true;
        return (
          (params.channelTypes as string[]).includes(channel.type) ?? false
        );
      }
    );

    setSelected(filteredChannels);
    markChanged();
  });

  return [
    selected,
    ChannelSelect({
      customId,
      channelTypes: params.channelTypes,
    }),
  ];
};

export const useChannelSingleSelectComponent = <
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
>(
  params: {
    channelTypes?: ChannelTypes[];
    onSelected?: (
      selected: ChannelSelectResultValue<ChannelTypes> | null
    ) => void;
  } = {}
): UseChannelSingleSelectComponentResult<ChannelTypes> => {
  const [selected, select] = useChannelSelectComponent({
    channelTypes: params.channelTypes,
    onSelected: (selected) => {
      params.onSelected?.(selected[0] ?? null);
    },
  });

  return [
    selected[0] ?? null,
    select({
      maxValues: 1,
    }),
  ];
};
