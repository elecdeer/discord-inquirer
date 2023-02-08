import { ChannelSelect } from "../../adaptor";
import { useChannelSelectEvent } from "../effect/useChannelSelectEvent";
import { useObserveValue } from "../effect/useObserveValue";
import { useCustomId } from "../state/useCustomId";
import { useState } from "../state/useState";

import type {
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

export type UseChannelSelectComponentParams<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = {
  channelTypes?: ChannelTypes[];

  onSelected?: (selected: ChannelSelectResultValue<ChannelTypes>[]) => void;

  minValues?: number;

  maxValues?: number;
};

export type UseChannelSelectComponentResult<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = [
  selectResult: ChannelSelectResultValue<ChannelTypes>[],
  ChannelSelect: ChannelSelectComponentBuilder<{
    customId: string;
    minValues: number | undefined;
    maxValues: number | undefined;
  }>
];

export type UseChannelSingleSelectComponentParams<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = {
  channelTypes?: ChannelTypes[];
  onSelected?: (
    selected: ChannelSelectResultValue<ChannelTypes> | null
  ) => void;
  minValues?: 1;
};

export type UseChannelSingleSelectComponentResult<
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
> = [
  selectResult: ChannelSelectResultValue<ChannelTypes> | null,
  ChannelSelect: ChannelSelectComponentBuilder<{
    customId: string;
    minValues: 1 | undefined;
    maxValues: 1;
  }>
];

/**
 * ChannelSelectコンポーネントと選択状態を提供するRenderHook
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param maxValues 選択可能なチャンネルの最大数 (デフォルト: 制限無し)
 * @param minValues 選択可能なチャンネルの最小数 (デフォルト: 0)
 * @param channelTypes 選択可能なチャンネルの種類 (デフォルト: 全てのチャンネル)
 * @returns [selectResult, ChannelSelectComponentBuilder]
 */
export const useChannelSelectComponent = <
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
>({
  onSelected,
  maxValues,
  minValues,
  channelTypes,
}: UseChannelSelectComponentParams<ChannelTypes> = {}): UseChannelSelectComponentResult<ChannelTypes> => {
  const customId = useCustomId("channelSelect");

  const [selected, setSelected] = useState<
    ChannelSelectResultValue<ChannelTypes>[]
  >([]);

  const markChanged = useObserveValue(selected, onSelected);

  useChannelSelectEvent(customId, async (_, channels, deferUpdate) => {
    await deferUpdate();

    const filteredChannels = channels.filter(
      (channel): channel is ChannelSelectResultValue<ChannelTypes> => {
        if (channelTypes === undefined) return true;
        return (channelTypes as string[]).includes(channel.type) ?? false;
      }
    );

    setSelected(filteredChannels);
    markChanged();
  });

  return [
    selected,
    ChannelSelect({
      customId,
      channelTypes: channelTypes,
      minValues: minValues,
      maxValues: maxValues,
    }),
  ];
};

/**
 * ChannelSelectコンポーネントと選択状態を提供するRenderHook
 * @param onSelected 選択状態が変化した時に呼ばれるハンドラ
 * @param minValues 選択可能なチャンネルの最小数 useChannelSingleSelectComponentでは0か1しか指定できない (デフォルト: 0)
 * @param channelTypes 選択可能なチャンネルの種類 (デフォルト: 全てのチャンネル)
 * @returns [selectResult, ChannelSelectComponentBuilder]
 */
export const useChannelSingleSelectComponent = <
  ChannelTypes extends AdaptorChannelTypes = AdaptorChannelTypes
>({
  onSelected,
  channelTypes,
  minValues,
}: UseChannelSingleSelectComponentParams<ChannelTypes> = {}): UseChannelSingleSelectComponentResult<ChannelTypes> => {
  const [selected, select] = useChannelSelectComponent({
    channelTypes: channelTypes,
    onSelected: (selected) => {
      onSelected?.(selected[0] ?? null);
    },
    minValues: minValues,
    maxValues: 1,
  });

  return [selected[0] ?? null, select];
};
